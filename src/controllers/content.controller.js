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

module.exports = {
  testContent
};
