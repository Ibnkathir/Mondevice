const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role });
    return res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET || "bidaya-secret",
      { expiresIn: "12h" }
    );
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login };
