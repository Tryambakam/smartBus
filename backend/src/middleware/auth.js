const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.token;
    
    // Fallback for development explicit passing, if needed
    if (!token) {
      const header = req.headers.authorization || "";
      const [type, t] = header.split(" ");
      if (type === "Bearer" && t) token = t;
    }

    if (!token) {
      return res.status(401).json({ ok: false, error: "Missing authentication token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid/expired token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ ok: false, error: "Access denied. No role assigned." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "Access denied. Insufficient permissions." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
