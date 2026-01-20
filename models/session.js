const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ipAddress: {
      type: String,
      set: encrypt, // 🔐
      get: decrypt, // 🔓
    },

    device: {
      type: String,
      set: encrypt, // 🔐
      get: decrypt, // 🔓
    },

    token: {
      type: String,
      set: encrypt, // 🔐
      get: decrypt, // 🔓
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },

    logoutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,

    // 🔥 WAJIB agar decrypt aktif saat response API
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Session", sessionSchema);
