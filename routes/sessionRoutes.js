const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

/**
 * Helper: normalisasi IP (IPv6 → IPv4)
 */
function normalizeIP(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "-";

  // kalau array (proxy)
  if (Array.isArray(ip)) ip = ip[0];

  // ::ffff:192.168.x.x → 192.168.x.x
  if (typeof ip === "string" && ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // localhost ipv6
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
}

/**
 * ✅ CREATE SESSION (LOGIN)
 * POST /api/sessions
 */
router.post("/", authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const session = await Session.create({
    user: req.user.id,
    ipAddress: req.ip.replace("::ffff:", ""),
    device: req.body.device || req.headers["user-agent"],
    token,
  });

  res.status(201).json(session);
});

/**
 * ✅ LOGOUT (tutup session aktif)
 */
router.put("/logout", authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization tidak ada" });
    }

    const token = authHeader.split(" ")[1];

    await Session.findOneAndUpdate(
      { token, logoutTime: { $exists: false } },
      { logoutTime: new Date() }
    );

    res.json({ message: "Logout berhasil" });
  } catch (err) {
    console.error("❌ Gagal logout:", err);
    res.status(500).json({ message: "Gagal logout" });
  }
});

/**
 * ✅ GET ALL SESSION (ADMIN ONLY)
 * GET /api/sessions
 */
router.get("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const currentToken = req.headers.authorization.split(" ")[1];

  try {
    const sessions = await Session.find()
      .populate("user", "name username role")
      .sort({ loginTime: -1 });

    res.json(
      sessions.map((s) => ({
        _id: s._id,
        name: s.user?.name || "-",
        username: s.user?.username || "-",
        role: s.user?.role || "-",
        ip: s.ipAddress || "-",
        device: s.device || "-",
        timestamp: s.loginTime,
        logoutTime: s.logoutTime || null,
        isCurrent: s.token === currentToken,
      }))
    );
  } catch (err) {
    console.error("❌ Gagal mengambil session:", err);
    res.status(500).json({ message: "Gagal mengambil session" });
  }
});

module.exports = router;
