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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB error:", err));

const secret = encrypt("2111510448 AES 256");
// console.log("Encrypted:", secret);
console.log("Decrypted:", decrypt(secret));
