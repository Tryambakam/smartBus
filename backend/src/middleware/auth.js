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

module.exports = { requireAuth };
