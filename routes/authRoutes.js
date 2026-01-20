const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Session = require("../models/session");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

/* =========================
   REGISTER USER (ADMIN ONLY)
========================= */
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body || {};

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username dan password wajib diisi" });
//     }

//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(400).json({ message: "User tidak ditemukan" });
//     }

//     const match = await user.comparePassword(password);
//     if (!match) {
//       return res.status(400).json({ message: "Password salah" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, user });
//   } catch (err) {
//     console.error("❌ LOGIN ERROR FULL:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.post("/register", async (req, res) => {
  let { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({
      error: "Nama, username, dan password wajib diisi",
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username sudah digunakan",
      });
    }

    const newUser = new User({
      name,
      username,
      password,
      role: "admin",
    });

    await newUser.save();

    res.status(201).json({
      message: "Register admin berhasil (testing mode)",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal register" });
  }
});


/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: "Password salah" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // update last login
  user.lastLogin = new Date();
  user.lastLoginIP = req.ip;
  await user.save();

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });
});

/* =========================
   CHECK TOKEN
========================= */
router.get("/check", authenticateToken, (req, res) => {
  res.status(200).json({ ok: true });
});

/* =========================
   GET ALL USERS (ADMIN)
========================= */
router.get(
  "/users/all",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mengambil data user" });
    }
  }
);

/* =========================
   DELETE USER (ADMIN)
========================= */
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User berhasil dihapus" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal menghapus user" });
    }
  }
);

/* =========================
   CHANGE ROLE (ADMIN)
========================= */
router.put(
  "/users/:id/role",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { role } = req.body;

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ error: "Role tidak valid" });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

      res.json({ message: "Role user berhasil diubah", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mengubah role user" });
    }
  }
);

/* =========================
   SESSION LIST (ADMIN)
========================= */
router.get(
  "/sessions",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const sessions = await Session.find()
        .populate("user", "name username role")
        .sort({ loginTime: -1 });

      const formatted = sessions.map((s) => ({
        _id: s._id,
        name: s.user?.name || "-",
        username: s.user?.username || "-",
        role: s.user?.role || "-",
        ip: s.ipAddress || "-",
        device: s.device || "-",
        timestamp: s.loginTime || "-",
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mengambil data session" });
    }
  }
);

module.exports = router;
