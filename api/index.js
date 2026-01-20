const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes");
const productRoutes = require("../routes/productRoutes");
const logRoutes = require("../routes/logRoutes");
const sessionRoutes = require("../routes/sessionRoutes");

const app = express();

/* =========================
   MIDDLEWARE WAJIB
========================= */
app.use(cors());
app.use(express.json()); // 🔥 INI YANG KURANG
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/sessions", sessionRoutes);

/* =========================
   TEST ROOT
========================= */
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

/* =========================
   DB (JANGAN LISTEN)
========================= */
mongoose.connect(process.env.MONGO_URI);

module.exports = app;
