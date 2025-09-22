const express = require("express");
const { passport, authenticateJWT } = require("../passport");
const multer = require("multer");
const upload = multer(); // pakai memory storage (buffer)

const { getDashboardData, getArtikelData, getDetailByKode, getProgramData, getProfile, searchAllKonten, searchKontenArtikel, searchKontenProgram } = require("../controllers/user.controller");

const router = express.Router();

router.get("/konten/:kodeKonten", getDetailByKode); 
router.get("/dashboard", getDashboardData); 
router.get("/program", getProgramData); 
router.get("/artikel", getArtikelData); 
router.get("/profile", getProfile)
router.get('/search', searchAllKonten);
router.get('/search/artikel', searchKontenArtikel);
router.get('/search/program', searchKontenProgram);

module.exports = router;
