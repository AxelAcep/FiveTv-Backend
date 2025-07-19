const express = require("express");
const { passport, authenticateJWT } = require("../passport");

const {
    testContent,
} = require("../controllers");

const router = express.Router();

router.get('/content', testContent);

module.exports = router;
