const express = require("express");
const { passport, authenticateJWT } = require("../passport");
const multer = require("multer");
const upload = multer(); 
const cron = require("node-cron");

const { 
  getDashboardData, getArtikelData, getDetailByKode, getProgramData, 
  getProfile, searchAllKonten, searchKontenArtikel, searchKontenProgram, getWebsiteConfigKonten, generateMonthlyView
} = require("../controllers/user.controller");

const router = express.Router();

// ================= ROUTE USER =================
router.get("/konten/:kodeKonten", getDetailByKode); 
router.get("/dashboard", getDashboardData); 
router.get("/program", getProgramData); 
router.get("/artikel", getArtikelData); 
router.get("/profile", getProfile);
router.get('/search', searchAllKonten);
router.get('/search/artikel', searchKontenArtikel);
router.get('/search/program', searchKontenProgram);
router.get('/rekomen', getWebsiteConfigKonten);

// ================= MONTHLY VIEW =================
// endpoint manual
router.post("/monthly-view/generate", generateMonthlyView);

// cron otomatis tanggal 1 jam 00:00
cron.schedule("0 0 1 * *", () => {
  console.log("🚀 Cron jalan: generateMonthlyView otomatis (tanggal 1)");
  generateMonthlyView(); // dipanggil tanpa req/res
});

module.exports = router;
