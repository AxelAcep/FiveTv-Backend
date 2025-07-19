const express = require("express");
const { passport, authenticateJWT } = require("../passport");
const multer = require("multer");
const upload = multer(); // pakai memory storage (buffer)

const { testUser } = require("../controllers");

const router = express.Router();


router.get("/test", testUser);



module.exports = router;
