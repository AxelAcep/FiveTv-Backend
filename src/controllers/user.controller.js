// konten.controller.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fungsi untuk mendapatkan data Dashboard (TIDAK BERUBAH)
const getDashboardData = async (req, res) => {
  try {
    const kontenTerbaru = await prisma.konten.findMany({
      orderBy: { tanggal: 'desc' },
      take: 5,
    });
    const kontenTerpopuler = await prisma.konten.findMany({
      orderBy: { viewMonth: 'desc' },
      take: 5,
    });
    const artikelTerbaru = await prisma.konten.findMany({
      where: { kategori: 'artikel' },
      orderBy: { tanggal: 'desc' },
      take: 5,
    });
    const programTerbaru = await prisma.konten.findMany({
      where: { kategori: 'program' },
      orderBy: { tanggal: 'desc' },
      take: 5,
    });

    res.status(200).json({
      kontenTerbaru,
      kontenTerpopuler,
      artikelTerbaru,
      programTerbaru,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Fungsi untuk mendapatkan data halaman Artikel (TIDAK BERUBAH)
// Fungsi ini hanya mengambil 5 artikel terbaru dan 5 terpopuler
const getArtikelData = async (req, res) => {
  try {
    // ambil query param page & limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const artikelTerbaru = await prisma.konten.findMany({
      where: { kategori: 'artikel' },
      orderBy: { tanggal: 'desc' },
      skip,
      take: limit,
    });

    const artikelTerpopuler = await prisma.konten.findMany({
      where: { kategori: 'artikel' },
      orderBy: { viewMonth: 'desc' },
      take: 5, // biasanya top 5 cukup statis
    });

    res.status(200).json({
      artikelTerbaru,
      artikelTerpopuler,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching artikel data:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// Fungsi untuk mendapatkan data halaman Program (TIDAK BERUBAH)
// Fungsi ini hanya mengambil 5 program terbaru dan 5 terpopuler
const getProgramData = async (req, res) => {
  try {
    // ambil query param page & limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const programTerbaru = await prisma.konten.findMany({
      where: { kategori: 'program' },
      orderBy: { tanggal: 'desc' },
      skip,
      take: limit,
    });

    const programTerpopuler = await prisma.konten.findMany({
      where: { kategori: 'program' },
      orderBy: { viewMonth: 'desc' },
      take: 5, // biasanya top 5 cukup statis
    });

    res.status(200).json({
      programTerbaru,
      programTerpopuler,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching artikel data:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// FUNGSI BARU untuk mendapatkan konten dengan paginasi
// Ini yang akan Anda gunakan untuk "load more" atau "infinite scroll"
const getPaginatedKonten = async (req, res) => {
  const { kategori, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Pastikan kategori yang diminta valid
  if (kategori !== 'artikel' && kategori !== 'program') {
    return res.status(400).json({ message: 'Kategori tidak valid.' });
  }

  try {
    const konten = await prisma.konten.findMany({
      where: { kategori },
      orderBy: { tanggal: 'desc' },
      skip,
      take,
    });

    res.status(200).json(konten);
  } catch (error) {
    console.error(`Error fetching paginated konten for kategori ${kategori}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Fungsi untuk mendapatkan detail konten berdasarkan ID (TIDAK BERUBAH)
const getDetailByKode = async (req, res) => {
  const { kodeKonten } = req.params;

  try {
    // 1. Cek apakah konten dengan kodeKonten tersebut ada
    const konten = await prisma.konten.findUnique({
      where: { kodeKonten: String(kodeKonten) },
    });

    console.log(kodeKonten);

    // 2. Jika konten tidak ditemukan, kirimkan respons 404
    if (!konten) {
      return res.status(404).json({ message: 'Konten not found.' });
    }

    // 3. Jika ditemukan, lakukan operasi update untuk menambah view
    //    Gunakan updateMany agar tidak gagal jika ada data ganda atau masalah lain
    await prisma.konten.updateMany({
      where: { kodeKonten: String(kodeKonten) },
      data: { view: { increment: 1 } },
    });
    
    // 4. Ambil ulang data konten dengan view yang sudah diperbarui
    const updatedKonten = await prisma.konten.findUnique({
      where: { kodeKonten: String(kodeKonten) },
    });

    // 5. Ambil konten terkait lainnya
    const kontenTerpopuler = await prisma.konten.findMany({
      where: {
        kategori: konten.kategori,
        NOT: { kodeKonten: konten.kodeKonten },
      },
      orderBy: { viewMonth: 'desc' },
      take: 5,
    });

    const kontenTerbaru = await prisma.konten.findMany({
      where: {
        kategori: konten.kategori,
        NOT: { kodeKonten: konten.kodeKonten },
      },
      orderBy: { tanggal: 'desc' },
      take: 5,
    });

    res.status(200).json({
      konten: updatedKonten,
      kontenTerpopuler,
      kontenTerbaru,
    });

  } catch (error) {
    console.error(`Error getting konten with kodeKonten ${kodeKonten}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    // Ambil data WebsiteConfig dengan id 1
    const websiteConfig = await prisma.websiteConfig.findUnique({
      where: { id: 1 },
    });

    // Ambil semua data Pengurus
    const semuaPengurus = await prisma.pengurus.findMany();

    // Jika websiteConfig tidak ditemukan, berikan pesan error
    if (!websiteConfig) {
      return res.status(404).json({ message: 'Website config not found.' });
    }

    // Kirim data sebagai respons JSON
    res.status(200).json({
      websiteConfig,
      semuaPengurus,
    });
  } catch (error) {
    console.error("Error getting profile data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const searchAllKonten = async (req, res) => {
  const { q } = req.query; // Ambil query pencarian dari URL (e.g., ?q=kata kunci)

  try {
    const konten = await prisma.konten.findMany({
      where: {
        judul: {
          contains: q, // Cari judul yang mengandung kata kunci
          mode: 'insensitive', // Pencarian tidak sensitif terhadap huruf besar/kecil
        },
      },
      // Mengurutkan hasil berdasarkan relevansi atau tanggal
      orderBy: {
        tanggal: 'desc',
      },
    });

    res.status(200).json(konten);
  } catch (error) {
    console.error('Error saat mencari semua konten:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Endpoint 2: Cari konten dengan kategori "artikel"
const searchKontenArtikel = async (req, res) => {
  const { q } = req.query;

  try {
    const konten = await prisma.konten.findMany({
      where: {
        kategori: 'artikel',
        judul: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    res.status(200).json(konten);
  } catch (error) {
    console.error('Error saat mencari konten artikel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Endpoint 3: Cari konten dengan kategori "program"
const searchKontenProgram = async (req, res) => {
  const { q } = req.query;

  try {
    const konten = await prisma.konten.findMany({
      where: {
        kategori: 'program',
        judul: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    res.status(200).json(konten);
  } catch (error) {
    console.error('Error saat mencari konten program:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getWebsiteConfigKonten = async (req, res) => {
  try {
    const config = await prisma.websiteConfig.findUnique({
      where: { id: 1 },
      select: {
        kontenI_data: {
          select: {
            kodeKonten: true,
            judul: true,
            penulis: true,
            linkGambar: true,
            kategori: true,
            isiHTML: true,
          },
        },
        kontenII_data: {
          select: {
            kodeKonten: true,
            judul: true,
            penulis: true,
            linkGambar: true,
            kategori: true,
            isiHTML: true,
          },
        },
        kontenIII_data: {
          select: {
            kodeKonten: true,
            judul: true,
            penulis: true,
            linkGambar: true,
            kategori: true,
            isiHTML: true,
          },
        },
      },
    });

    if (!config) {
      return res.status(404).json({ message: "WebsiteConfig not found" });
    }

    // Kumpulkan konten yang tidak null
    const kontenList = [
      config.kontenI_data,
      config.kontenII_data,
      config.kontenIII_data,
    ].filter(Boolean); // buang null

    if (kontenList.length === 0) {
      return res.status(404).json({ message: "No konten available" });
    }

    // Random pilih satu konten
    const randomIndex = Math.floor(Math.random() * kontenList.length);
    const randomKonten = kontenList[randomIndex];

    return res.json(randomKonten);
  } catch (error) {
    console.error("Error fetching WebsiteConfig konten:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Menggabungkan dan mengekspor semua fungsi
module.exports = {
  getDashboardData,
  getArtikelData,
  getProgramData,
  getPaginatedKonten,
  getDetailByKode,
  getProfile,
  searchAllKonten,
  searchKontenArtikel,
  searchKontenProgram,
  getWebsiteConfigKonten,
  
};