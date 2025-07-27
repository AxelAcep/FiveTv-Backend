const { PrismaClient } = require("@prisma/client");
const ClientError = require("../errors/ClientError");
const passport = require("passport");
const { get } = require("http");
const prisma = new PrismaClient();
const supabase = require("../dataStorage");
const axios = require("axios");

const testContent = async (req, res, next) => {
  try {
    console.log("Test")
    return res.status(200)

  } catch (error) {
    // Check if the error is a Prisma KnownRequestError (e.g., if Dosen not found)
    if (error.code === 'P2025') { // Prisma's record not found error
      return res.status(404).json({ message: `Dosen with NIDN ${req.body.nidn} not found.` });
    }
    console.error("Error deleting Dosen:", error);
    return next(error); // Pass error to the next error handling middleware
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client after operation
  }
};

const getAllKonten = async (req, res) => {
  try {
    const konten = await prisma.konten.findMany({
      select: {
        // Hanya memilih kolom yang diminta
        kodeKonten: true,
        penulis: true,
        view: true,
        tanggal: true,
        kategori: true,
        linkGambar: true,
      },
      orderBy: {
        tanggal: 'desc', // Urutkan berdasarkan tanggal terbaru
      },
    });
    res.status(200).json({
      message: "Berhasil mendapatkan semua konten.",
      data: konten,
    });
  } catch (error) {
    console.error("Kesalahan mendapatkan semua konten:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};


const getAllDivisi = async (req, res) => {
  try {
    const divisi = await prisma.divisi.findMany({
      select: {
        // Hanya memilih kolom yang diminta
        nama: true,
        deskripsi: true,
      },
      orderBy: {
        nama: 'asc', // Urutkan berdasarkan nama divisi
      },
    });
    res.status(200).json({
      message: "Berhasil mendapatkan semua divisi.",
      data: divisi,
    });
  } catch (error) {
    console.error("Kesalahan mendapatkan semua divisi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

const getDivisiById = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter URL

  try {
    const divisi = await prisma.divisi.findUnique({
      where: {
        id: parseInt(id), // ID dari URL selalu string, jadi harus di-parse ke integer
      },
      include: {
        anggota: { // Sertakan semua pengurus yang terkait dengan divisi ini
          select: {
            id: true,
            nama: true,
            nim: true,
            prodi: true,
            jabatan: true,
            fotoLink: true,
          },
          orderBy: {
            nama: 'asc', // Urutkan pengurus berdasarkan nama
          },
        },
      },
    });

    if (!divisi) {
      return res.status(404).json({ message: "Divisi tidak ditemukan." });
    }

    res.status(200).json({
      message: "Detail divisi berhasil ditemukan.",
      data: divisi,
    });
  } catch (error) {
    console.error("Kesalahan mendapatkan detail divisi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

const getAllArtikelKonten = async (req, res) => {
  try {
    const artikels = await prisma.konten.findMany({
      where: {
        kategori: 'artikel',
      },
      orderBy: {
        tanggal: 'desc', // Mengurutkan dari terbaru ke terlama
      },
    });
    res.status(200).json(artikels);
  } catch (error) {
    console.error('Error getting all artikel konten:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Mendapatkan semua Konten dengan kategori 'kegiatan', diurutkan dari terbaru ke terlama.
 */
const getAllKegiatanKonten = async (req, res) => {
  try {
    const kegiatans = await prisma.konten.findMany({
      where: {
        kategori: 'kegiatan',
      },
      orderBy: {
        tanggal: 'desc', // Mengurutkan dari terbaru ke terlama
      },
    });
    res.status(200).json(kegiatans);
  } catch (error) {
    console.error('Error getting all kegiatan konten:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Mendapatkan 5 Konten dengan jumlah 'view' terbanyak.
 */
const getTop5MostViewedKonten = async (req, res) => {
  try {
    const mostViewed = await prisma.konten.findMany({
      orderBy: {
        view: 'desc', // Mengurutkan dari view terbanyak
      },
      take: 5, // Mengambil 5 data teratas
    });
    res.status(200).json(mostViewed);
  } catch (error) {
    console.error('Error getting top 5 most viewed konten:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Mendapatkan Konten berdasarkan 'kodeKonten' (ID).
 */
const getKontenById = async (req, res) => {
  const { kodeKonten } = req.params; // Mengambil kodeKonten dari parameter URL

  try {
    const konten = await prisma.konten.findUnique({
      where: {
        kodeKonten: kodeKonten,
      },
    });

    if (!konten) {
      return res.status(404).json({ message: 'Konten not found.' });
    }

    res.status(200).json(konten);
  } catch (error) {
    console.error(`Error getting konten with kodeKonten ${kodeKonten}:`, error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  testContent,
  getAllDivisi,
  getAllKonten,
  getDivisiById,
  getAllArtikelKonten,
  getAllKegiatanKonten,
  getTop5MostViewedKonten,
  getKontenById,
};
