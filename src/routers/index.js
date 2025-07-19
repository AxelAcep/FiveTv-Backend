const express = require("express");

const adminRoutes = require("./admin.routes");
const userRoutes = require("./user.routes");
const contentRoutes = require("./content.routes");

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/content", contentRoutes);

module.exports = router;
