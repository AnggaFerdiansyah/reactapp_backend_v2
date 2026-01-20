const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");

const LogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
      set: encrypt, // 🔐 ENKRIPSI SAAT DISIMPAN
      get: decrypt, // 🔓 DEKRIPSI SAAT DIBACA
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,

    // ⚠️ WAJIB agar decrypt aktif saat dikirim ke frontend
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Log", LogSchema);
