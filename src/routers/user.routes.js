const express = require("express");
const { passport, authenticateJWT } = require("../passport");
const multer = require("multer");
const upload = multer(); // pakai memory storage (buffer)

const { getAllKonten, getAllArtikelKonten, getAllKegiatanKonten, getTop5MostViewedKonten, getKontenById } = require("../controllers/user.controller");

const router = express.Router();


router.get("/test", getAllKonten);
router.get("/konten", getAllKonten);
router.get("/artikel", getAllArtikelKonten);
router.get("/kegiatan", getAllKegiatanKonten); 
router.get("/trending", getTop5MostViewedKonten);

router.get("/konten/:kodeKonten", getKontenById); 



module.exports = router;
