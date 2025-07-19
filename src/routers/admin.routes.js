const express = require("express");
const { passport, authenticateJWT } = require("../passport");

const { loginAdmin, registerAdmin, postKonten, postDivisi, postPengurus } = require("../controllers");

const { loginRateLimiter } = require("../middlewares/RateLimit");

const router = express.Router();

router.post("/login", loginRateLimiter ,loginAdmin);
router.post("/register", loginRateLimiter , authenticateJWT ,registerAdmin);

router.post("/konten", authenticateJWT, postKonten)
router.post("/divisi", authenticateJWT, postDivisi)
router.post("/pengurus", authenticateJWT, postPengurus)

module.exports = router;
