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

// 🔗 API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/sessions", sessionRoutes);

// 🔌 MongoDB connection (AMAN UNTUK SERVERLESS)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

// ⛔ JANGAN listen di production (Vercel)
if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// Optional test root
app.get("/", (req, res) => {
  res.send("API is running");
});

const secret = encrypt("2111510448 AES 256");
console.log("Decrypted:", decrypt(secret));

module.exports = { app, connectDB };
