const jwt = require("jsonwebtoken");

// Middleware: Cek token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau kadaluarsa" });
    }

    req.user = decoded; // simpan info user dari token
    next();
  });
}

// Middleware: Cek role user
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};
