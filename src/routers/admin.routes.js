const express = require("express");
const { passport, authenticateJWT } = require("../passport");

const { loginAdmin, registerAdmin, getDashboardStats, getAllKonten, searchKonten,
     createKonten, getAllJenis, getKontenByKode, updateKonten, deleteKonten,
    getAllPengurus, updatePengurus, deletePengurus, getPengurusById, addPengurus, 
    updateWebsiteConfig,
    getWebsiteConfig,
    addJenis} = require("../controllers");

const { loginRateLimiter } = require("../middlewares/RateLimit");

const router = express.Router();

router.post("/login", loginRateLimiter ,loginAdmin);
router.post("/register", authenticateJWT ,loginRateLimiter ,registerAdmin);
router.post("/konten", authenticateJWT ,createKonten);
router.post("/anggota", authenticateJWT , addPengurus);
router.post("/jenis", authenticateJWT , addJenis);

router.get("/dashboard", authenticateJWT ,getDashboardStats);
router.get("/konten", authenticateJWT , getAllKonten);
router.get("/search", authenticateJWT ,searchKonten);
router.get("/jenis", authenticateJWT ,getAllJenis);
router.get("/konten/:kodeKonten", getKontenByKode);
router.get("/anggota", getAllPengurus);
router.get("/anggota/:nim", getPengurusById);
router.get("/config", getWebsiteConfig);

router.put("/konten/:kodeKonten", authenticateJWT ,updateKonten);
router.put("/anggota/:nim", authenticateJWT ,updatePengurus);
router.put("/config", authenticateJWT ,updateWebsiteConfig);

router.delete("/konten/:kodeKonten", authenticateJWT ,deleteKonten);
router.delete("/anggota/:nim", authenticateJWT ,deletePengurus);

module.exports = router;
