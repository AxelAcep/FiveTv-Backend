const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const { passport } = require("./passport");

const router = require("./routers");
const NotFoundMiddleware = require("./middlewares/NotFoundHandler");
const ErrorHandlerMiddleware = require("./middlewares/ErrorHandler");

const app = express();
const port = process.env.PORT || 5500;

/**
 * 🔹 CORS Setup
 * For now: allow all origins (for testing)
 * Later: change `origin` to your frontend URL, e.g. "https://yourapp.vercel.app"
 */
app.use(cors({
  origin: "*",          // ⚠️ TEMPORARY: allows all origins
  credentials: true     // required if you use cookies/sessions
}));

// Middleware
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "Service",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,   // set true if HTTPS
      sameSite: "lax"  // change to "none" if cross-site cookies are needed
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Middlewares
app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

// Server
app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
});
