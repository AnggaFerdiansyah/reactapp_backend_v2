const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

/* =========================
   GET PRODUK AKTIF (INVENTORY)
========================= */
// GET PRODUK AKTIF (TERMASUK DATA LAMA)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { isArchived: false },
        { isArchived: { $exists: false } }, // 🔥 DATA LAMA MASUK
      ],
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("❌ Gagal mengambil produk:", err);
    res.status(500).json({ error: "Gagal mengambil data produk" });
  }
});

/* =========================
   GET PRODUK ARSIP
========================= */
router.get("/archived", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ isArchived: true }).sort({
      archivedAt: -1,
    });

    res.json(products);
  } catch (err) {
    console.error("❌ Gagal mengambil arsip:", err);
    res.status(500).json({ error: "Gagal mengambil data arsip" });
  }
});

/* =========================
   TAMBAH PRODUK
========================= */
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin", "staff"),
  async (req, res) => {
    try {
      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        product,
      });
    } catch (err) {
      console.error("❌ Gagal menambahkan produk:", err);
      res.status(400).json({
        success: false,
        message: "Gagal menambahkan produk",
      });
    }
  }
);

/* =========================
   UPDATE PRODUK
========================= */
router.put("/:id", authenticateToken, async (req, res) => {
  const { name, code, stock, unit, color } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, code, stock, unit, color },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    res.json({
      message: "Produk berhasil diperbarui",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Gagal memperbarui produk:", err);
    res.status(400).json({ error: "Gagal memperbarui produk" });
  }
});

/* =========================
   SOFT DELETE (ARSIP)
========================= */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    product.isArchived = true;
    product.archivedAt = new Date();
    await product.save();

    res.json({
      success: true,
      message: "Produk berhasil diarsipkan",
      product,
    });
  } catch (err) {
    console.error("❌ Gagal mengarsipkan produk:", err);
    res.status(500).json({ error: "Gagal mengarsipkan produk" });
  }
});
/* =========================
   RESTORE PRODUK (UN-ARCHIVE)
========================= */
router.put(
  "/:id/restore",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      product.isArchived = false;
      product.archivedAt = null;
      await product.save();

      res.json({
        success: true,
        message: "Produk berhasil dipulihkan",
        product,
      });
    } catch (err) {
      console.error("❌ Gagal memulihkan produk:", err);
      res.status(500).json({ error: "Gagal memulihkan produk" });
    }
  }
);
/* =========================
   HARD DELETE (ARCHIVE ONLY)
========================= */
router.delete(
  "/:id/hard",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      // 🔒 WAJIB sudah arsip
      if (!product.isArchived) {
        return res.status(400).json({
          error: "Produk belum diarsipkan",
        });
      }

      await product.deleteOne();

      res.json({
        success: true,
        message: "Produk berhasil dihapus permanen",
      });
    } catch (err) {
      console.error("❌ Hard delete gagal:", err);
      res.status(500).json({
        error: "Gagal menghapus produk secara permanen",
      });
    }
  }
);

module.exports = router;
