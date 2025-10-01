const { PrismaClient } = require("@prisma/client");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Mengubah 'nidn' menjadi 'email' sebagai username
  async (email, password, done) => { // Mengubah parameter nidn menjadi email
    try {
      // Mencari admin berdasarkan email di tabel Admin
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin) {
        return done(null, false, { message: 'Email tidak ditemukan.' });
      }

      // Membandingkan password (Anda HARUS mengimplementasikan hashing password di sini!)
      // Contoh sederhana TANPA HASHING, hanya untuk ilustrasi:
      const isPasswordValid = admin.password === password;
      // Untuk keamanan, GANTI baris di atas dengan perbandingan password hashed (misalnya menggunakan bcrypt)
      // const isPasswordValid = await bcrypt.compare(password, admin.password);


      if (!isPasswordValid) {
        return done(null, false, { message: 'Password salah.' });
      }

      // Membuat token JWT hanya dengan email
      const token = jwt.sign(
        { email: admin.email }, // Mengubah nidn menjadi email
        process.env.JWT_SECRET,
        { expiresIn: '36h' } // Token berlaku selama 1 jam
      );

      // Mengembalikan objek admin dan token
      return done(null, { admin, token });
    } catch (err) {
      return done(err);
    }
  }
));

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Token tidak ada.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Mengubah dosen menjadi user
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid.' });
    }

    req.user = user; // Menyimpan informasi user (admin) di req
    next();
  });
}

module.exports = { passport, authenticateJWT };