const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // Untuk generate ID acak
const prisma = new PrismaClient();

// Fungsi helper untuk membuat ID acak
function generateKodeKonten(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // huruf besar + angka
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "KD-" + result;
}

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


const getDashboardStats = async (req, res) => {
  try {
    const periode = parseInt(req.query.periode) || 3; // default 3 bulan terakhir
    const now = new Date();

    // hitung awal periode
    const startDate = new Date(now.getFullYear(), now.getMonth() - (periode - 1), 1);

    // 🔹 Views per Periode (breakdown per bulan)
    const viewsPerPeriodeRaw = await prisma.monthly_view.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        views: true,
        tanggal: true,
      },
    });

    // Grouping per bulan-tahun
    const viewsPerPeriode = {};
    viewsPerPeriodeRaw.forEach(item => {
      const bulan = item.tanggal.getMonth() + 1;
      const tahun = item.tanggal.getFullYear();
      const key = `${tahun}-${bulan.toString().padStart(2, "0")}`;
      if (!viewsPerPeriode[key]) viewsPerPeriode[key] = 0;
      viewsPerPeriode[key] += item.views;
    });

    // 🔹 Total Views This Month
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalViewsThisMonth = await prisma.monthly_view.aggregate({
      _sum: { views: true },
      where: { tanggal: { gte: startThisMonth, lte: now } },
    });

    // 🔹 Total All Views
    const totalAllViews = await prisma.monthly_view.aggregate({
      _sum: { views: true },
    });

    // 🔹 Count Artikel
    const countArtikel = await prisma.konten.count({
      where: { kategori: 'artikel' },
    });

    // 🔹 Count Program
    const countProgram = await prisma.konten.count({
      where: { kategori: 'program' },
    });

    // 🔹 Most Views by Jenis (ikut periode)
    const mostViewsByJenisRaw = await prisma.monthly_view.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        views: true,
        jenis: { select: { nama: true } },
      },
    });

    const jenisViews = {};
    mostViewsByJenisRaw.forEach(item => {
      if (!item.jenis) return;
      const namaJenis = item.jenis.nama;
      if (!jenisViews[namaJenis]) jenisViews[namaJenis] = 0;
      jenisViews[namaJenis] += item.views;
    });

    const mostViewsByJenis = Object.entries(jenisViews).map(([jenis, totalViews]) => ({
      jenis,
      totalViews,
    }));

    return res.json({
      success: true,
      data: {
        viewsPerPeriode, // per bulan
        totalViewsThisMonth: totalViewsThisMonth._sum.views || 0,
        totalAllViews: totalAllViews._sum.views || 0,
        countArtikel,
        countProgram,
        mostViewsByJenis, // sudah ikut periode
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAllKonten = async (req, res) => {
  try {
    const kontens = await prisma.konten.findMany({
      select: {
        kodeKonten: true,
        penulis: true,
        judul: true,
        Editor: true,
        Reporter: true,
        linkGambar: true,
        view: true,
        viewMonth: true,
        tanggal: true,
        kategori: true,
        jenisId: true,
        jenis: { select: { nama: true } }, // optional, ambil nama jenis
      },
      orderBy: { tanggal: "desc" },
    });

    res.json({ success: true, data: kontens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch konten" });
  }
};

const searchKonten = async (req, res) => {
  try {
    const { penulis, judul, jenis, kategori, tanggal } = req.query; // bisa juga req.body

    // Bangun filter dinamis
    const filters = {};

    if (penulis) filters.penulis = { contains: penulis, mode: "insensitive" };
    if (judul) filters.judul = { contains: judul, mode: "insensitive" };
    if (kategori) filters.kategori = kategori; // enum: "program" atau "artikel"
    if (tanggal) {
      // filter by date exact match (yyyy-mm-dd)
      const start = new Date(tanggal);
      const end = new Date(tanggal);
      end.setDate(end.getDate() + 1);
      filters.tanggal = { gte: start, lt: end };
    }
    if (jenis) {
      // join ke relasi jenis
      filters.jenis = { is: { nama: { contains: jenis, mode: "insensitive" } } };
    }

    const results = await prisma.konten.findMany({
      where: filters,
      select: {
        kodeKonten: true,
        penulis: true,
        judul: true,
        Editor: true,
        Reporter: true,
        linkGambar: true,
        view: true,
        viewMonth: true,
        tanggal: true,
        kategori: true,
        jenisId: true,
        jenis: { select: { nama: true } },
      },
      orderBy: { tanggal: "desc" },
    });

    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to search konten" });
  }
};


const getAllJenis = async (req, res) => {
  try {
    const jenisList = await prisma.jenis.findMany({
      orderBy: { nama: "asc" }, // urut alfabet
      select: {
        id: true,
        nama: true,
      },
    });

    res.status(200).json({ success: true, data: jenisList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch jenis" });
  }
};

const createKonten = async (req, res) => {
  try {
    const {
      penulis,
      judul,
      Editor,
      Reporter,
      linkGambar,
      kategori,  // "program" atau "artikel"
      jenisId,   // opsional, bisa null
      isiHTML,
      caption,
    } = req.body;

    // Validasi minimal
    if (!penulis || !judul || !kategori || !isiHTML) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate kodeKonten otomatis
    const kodeKonten = generateKodeKonten(); // misal: KD-A3F7B

    const newKonten = await prisma.konten.create({
      data: {
        kodeKonten,
        penulis,
        judul,
        Editor: Editor || null,
        Reporter: Reporter || null,
        linkGambar: linkGambar || null,
        kategori,
        jenisId: jenisId || null,
        isiHTML,
        caption: caption || null,
      },
    });

    res.status(201).json({ success: true, data: newKonten });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create konten" });
  }
};

// file: controllers/kontenController.js
const getKontenByKode = async (req, res) => {
  try {
    const { kodeKonten } = req.params;

    const konten = await prisma.konten.findUnique({
      where: { kodeKonten },
      select: {
        kodeKonten: true,
        penulis: true,
        judul: true,
        Editor: true,
        Reporter: true,
        linkGambar: true,
        view: true,
        viewMonth: true,
        tanggal: true,
        kategori: true,
        jenisId: true,
        jenis: { select: { nama: true } },
        isiHTML: true,
        caption: true,
      },
    });

    if (!konten) {
      return res.status(404).json({ success: false, message: "Konten not found" });
    }

    res.status(200).json({ success: true, data: konten });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch konten" });
  }
};

// file: controllers/kontenController.js
const updateKonten = async (req, res) => {
  try {
    const { kodeKonten } = req.params;
    const {
      penulis,
      judul,
      Editor,
      Reporter,
      linkGambar,
      kategori,
      jenisId,
      isiHTML,
      caption,
    } = req.body;

    // Pastikan konten ada
    const existingKonten = await prisma.konten.findUnique({ where: { kodeKonten } });
    if (!existingKonten) {
      return res.status(404).json({ success: false, message: "Konten not found" });
    }

    const updatedKonten = await prisma.konten.update({
      where: { kodeKonten },
      data: {
        penulis: penulis || existingKonten.penulis,
        judul: judul || existingKonten.judul,
        Editor: Editor ?? existingKonten.Editor,
        Reporter: Reporter ?? existingKonten.Reporter,
        linkGambar: linkGambar ?? existingKonten.linkGambar,
        kategori: kategori || existingKonten.kategori,
        jenisId: jenisId ?? existingKonten.jenisId,
        isiHTML: isiHTML || existingKonten.isiHTML,
        caption: caption ?? existingKonten.caption,
      },
    });

    res.status(200).json({ success: true, data: updatedKonten });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update konten" });
  }
};

const deleteKonten = async (req, res) => {
  try {
    const { kodeKonten } = req.params;

    // Cek apakah konten ada
    const existingKonten = await prisma.konten.findUnique({
      where: { kodeKonten },
    });

    if (!existingKonten) {
      return res.status(404).json({ success: false, message: "Konten not found" });
    }

    // Hapus Konten
    await prisma.konten.delete({
      where: { kodeKonten },
    });

    res.status(200).json({ success: true, message: "Konten deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete konten" });
  }
};

const getAllPengurus = async (req, res) => {
  try {
    const pengurusList = await prisma.pengurus.findMany({
      orderBy: { nama: "asc" },
      select: {
        id: true,
        nama: true,
        nim: true,
        prodi: true,
        jabatan: true,
        fotoLink: true,
        divisi: true,
        linkedin: true,
        Instagram: true,
      },
    });

    res.status(200).json({ success: true, data: pengurusList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch pengurus" });
  }
};

const getPengurusById = async (req, res) => {
  try {
    const { nim } = req.params;

    const pengurus = await prisma.pengurus.findUnique({
      where: { nim: nim },
    });

    if (!pengurus) {
      return res.status(404).json({ success: false, message: "Pengurus not found" });
    }

    res.status(200).json({ success: true, data: pengurus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch pengurus" });
  }
};

const updatePengurus = async (req, res) => {
  try {
    const { nim } = req.params;
    const { nama, prodi, jabatan, fotoLink, divisi, linkedin, Instagram } = req.body;

    const existingPengurus = await prisma.pengurus.findUnique({
      where: { nim: nim },
    });

    if (!existingPengurus) {
      return res.status(404).json({ success: false, message: "Pengurus not found" });
    }

    const updatedPengurus = await prisma.pengurus.update({
      where: { nim: nim },
      data: {
        nama: nama || existingPengurus.nama,
        prodi: prodi || existingPengurus.prodi,
        jabatan: jabatan || existingPengurus.jabatan,
        fotoLink: fotoLink ?? existingPengurus.fotoLink,
        divisi: divisi || existingPengurus.divisi,
        linkedin: linkedin ?? existingPengurus.linkedin,
        Instagram: Instagram ?? existingPengurus.Instagram,
      },
    });

    res.status(200).json({ success: true, data: updatedPengurus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update pengurus" });
  }
};

const deletePengurus = async (req, res) => {
  try {
    const { nim } = req.params;

    const existingPengurus = await prisma.pengurus.findUnique({
      where: { nim: nim },
    });

    if (!existingPengurus) {
      return res.status(404).json({ success: false, message: "Pengurus not found" });
    }

    await prisma.pengurus.delete({
      where: { nim: nim },
    });

    res.status(200).json({ success: true, message: "Pengurus deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete pengurus" });
  }
};

const addPengurus = async (req, res) => {
  try {
    const { nama, nim, prodi, jabatan, fotoLink, divisi, linkedin, Instagram } = req.body;

    // Validasi minimal
    if (!nama || !nim || !prodi || !jabatan || !divisi) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Cek apakah nim sudah ada
    const existing = await prisma.pengurus.findUnique({ where: { nim } });
    if (existing) {
      return res.status(400).json({ success: false, message: "NIM already exists" });
    }

    // Buat pengurus baru (id otomatis increment)
    const newPengurus = await prisma.pengurus.create({
      data: {
        nama,
        nim,
        prodi,
        jabatan,
        fotoLink: fotoLink || null,
        divisi,
        linkedin: linkedin || null,
        Instagram: Instagram || null,
      },
    });

    res.status(201).json({ success: true, data: newPengurus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add pengurus" });
  }
};

const getWebsiteConfig = async (req, res) => {
  try {
    const config = await prisma.websiteConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      return res.status(404).json({ success: false, message: "WebsiteConfig with id=1 not found" });
    }

    res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get WebsiteConfig" });
  }
};

// UPDATE / PUT WebsiteConfig id=1
const updateWebsiteConfig = async (req, res) => {
  try {
    const {
      desc_satu,
      desc_dua,
      visi,
      misi,
      struktur,
      instagram,
      twitter,
      youtube,
      tiktok,
      linkedin,
      banner,
      kontenI_id,
      kontenII_id,
      kontenIII_id,
    } = req.body;

    const updatedConfig = await prisma.websiteConfig.update({
      where: { id: 1 },
      data: {
        desc_satu: desc_satu || null,
        desc_dua: desc_dua || null,
        visi: visi || null,
        misi: misi || null,
        struktur: struktur || null,
        instagram: instagram || null,
        twitter: twitter || null,
        youtube: youtube || null,
        tiktok: tiktok || null,
        linkedin: linkedin || null,
        banner: banner || null,
        kontenI_id: kontenI_id || null,
        kontenII_id: kontenII_id || null,
        kontenIII_id: kontenIII_id || null,
      },
    });

    res.status(200).json({ success: true, data: updatedConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update WebsiteConfig" });
  }
};

const addJenis = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ success: false, message: "Nama is required" });
    }

    // Cek apakah nama sudah ada
    const existing = await prisma.jenis.findUnique({
      where: { nama },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Jenis already exists" });
    }

    const newJenis = await prisma.jenis.create({
      data: { nama },
    });

    res.status(201).json({ success: true, data: newJenis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add Jenis" });
  }
};

// Ekspor semua fungsi di akhir
module.exports = {
  loginAdmin,
  registerAdmin,
  getDashboardStats,
  searchKonten,
  getAllKonten,
  createKonten,
  getAllJenis,
  updateKonten,
  getKontenByKode,
  deleteKonten,
  getAllPengurus,
  getPengurusById,
  updatePengurus,
  deletePengurus,
  addPengurus,
  updateWebsiteConfig,
  getWebsiteConfig,
  addJenis,
};