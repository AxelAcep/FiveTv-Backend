const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // Untuk generate ID acak
const prisma = new PrismaClient();

// Fungsi helper untuk membuat ID acak
const generateRandomId = () => {
  // Menghasilkan 3 byte random, konversi ke hex, ambil 5 karakter pertama, dan ubah ke uppercase
  return crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();
};

const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password diperlukan." });
  }

  try {
    // HASH PASSWORD DI SINI SEBELUM MENYIMPAN!
    const hashedPassword = await bcrypt.hash(password, 10); // '10' adalah saltRounds

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword, // Simpan password yang sudah di-hash
      },
    });

    res.status(201).json({
      message: "Admin berhasil didaftarkan.",
      admin: { email: newAdmin.email },
    });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }
    console.error("Kesalahan pendaftaran admin:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// --- Login Admin ---
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password diperlukan." });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }

    // Bandingkan password yang di-hash
    // PASTIKAN ANDA SUDAH MENGIMPLEMENTASIKAN HASHING PASSWORD SAAT PENDAFTARAN ADMIN!
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah." });
    }

    // Buat token JWT
    const token = jwt.sign(
      { email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token berlaku 1 jam
    );

    res.status(200).json({
      message: "Login berhasil.",
      token,
      email: admin.email,
    });
  } catch (error) {
    console.error("Kesalahan login:", error); // Log error untuk debugging
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// --- Post Divisi ---
const postDivisi = async (req, res) => {
  const { nama, deskripsi } = req.body;

  if (!nama || !deskripsi) {
    return res.status(400).json({ message: "Nama dan deskripsi divisi diperlukan." });
  }

  try {
    const newDivisi = await prisma.divisi.create({
      data: {
        nama,
        deskripsi,
      },
    });
    res.status(201).json({
      message: "Divisi berhasil dibuat.",
      divisi: newDivisi,
    });
  } catch (error) {
    // Tangani error jika nama divisi sudah ada (unique constraint)
    if (error.code === 'P2002' && error.meta?.target.includes('nama')) {
        return res.status(409).json({ message: "Nama divisi sudah ada." });
    }
    console.error("Kesalahan membuat divisi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// --- Post Konten ---
const postKonten = async (req, res) => {
  const {penulis ,kategori, isiHTML, linkGambar } = req.body; // <-- Tambahkan linkGambar di sini

  if (!kategori || !isiHTML) {
    return res.status(400).json({ message: "Kategori dan isi HTML konten diperlukan." });
  }

  const validKategori = ["artikel", "kegiatan"];
  if (!validKategori.includes(kategori)) {
    return res.status(400).json({ message: `Kategori tidak valid. Pilih dari: ${validKategori.join(", ")}` });
  }

  try {
    const newKonten = await prisma.konten.create({
      data: {
        kodeKonten: generateRandomId(),
        penulis,
        kategori,
        isiHTML,
        linkGambar, // <-- Tambahkan ini
        view: 0,
      },
    });
    res.status(201).json({
      message: "Konten berhasil dibuat.",
      konten: newKonten,
    });
  } catch (error) {
    console.error("Kesalahan membuat konten:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// --- Post Pengurus ---
const postPengurus = async (req, res) => {
  const { nama, nim, prodi, jabatan, fotoLink, divisiId } = req.body;

  // Pastikan semua field yang diperlukan ada
  if (!nama || !nim || !prodi || !jabatan || !fotoLink || !divisiId) {
    return res.status(400).json({ message: "Semua field pengurus diperlukan." });
  }

  try {
    const newPengurus = await prisma.pengurus.create({
      data: {
        nama,
        nim,
        prodi,
        jabatan,
        fotoLink,
        divisi: {
          connect: { id: parseInt(divisiId) }, // Menghubungkan ke Divisi yang ada
        },
      },
    });
    res.status(201).json({
      message: "Pengurus berhasil ditambahkan.",
      pengurus: newPengurus,
    });
  } catch (error) {
    // Tangani error jika NIM sudah ada (unique constraint)
    if (error.code === 'P2002' && error.meta?.target.includes('nim')) {
        return res.status(409).json({ message: "NIM sudah terdaftar." });
    }
    // Tangani error jika divisiId tidak valid atau tidak ditemukan
    if (error.code === 'P2025') { // P2025: An operation failed because it depends on one or more records that were required but not found.
        return res.status(404).json({ message: `Divisi dengan ID ${divisiId} tidak ditemukan.` });
    }
    console.error("Kesalahan membuat pengurus:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// Ekspor semua fungsi di akhir
module.exports = {
  loginAdmin,
  postDivisi,
  postKonten,
  postPengurus,
  registerAdmin,
};