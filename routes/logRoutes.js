const express = require("express");
const router = express.Router();
const Log = require("../models/log");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { action, detail } = req.body;

    if (!action || !detail) {
      return res
        .status(400)
        .json({ message: "Action dan detail wajib diisi." });
    }

    const userId = req.user.id;

    const log = await Log.create({
      userId,
      action,
      detail,
    });

    res.status(201).json(log);
  } catch (err) {
    console.error("❌ Gagal mencatat log:", err);
    res.status(500).json({ message: "Gagal mencatat log." });
  }
});

router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("userId", "name username")
      .sort({ createdAt: -1 });

    const formatted = logs.map((log) => ({
      _id: log._id,
      user: log.userId?.name || "-",
      action: log.action,
      detail: log.detail,
      timestamp: log.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Gagal mengambil log:", err);
    res.status(500).json({ message: "Gagal mengambil log." });
  }
});

module.exports = router;
