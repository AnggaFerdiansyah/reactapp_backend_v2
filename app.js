require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const logRoutes = require("./routes/logRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const { encrypt, decrypt } = require("./utils/crypto");

app.use(cors());
app.use(express.json());

// 🔗 API ROUTES (KONSISTEN)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/sessions", sessionRoutes);

module.exports = app;
