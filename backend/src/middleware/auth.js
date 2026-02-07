const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "bidaya-secret");
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

module.exports = authMiddleware;
