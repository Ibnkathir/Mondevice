const { User, Payment, Result, Course } = require("../models");
const { calculateProgress } = require("../services/progressService");

const listStudents = async (req, res, next) => {
  try {
    const students = await User.findAll({ where: { role: "ETUDIANT" } });
    return res.json(students);
  } catch (error) {
    return next(error);
  }
};

const studentOverview = async (req, res, next) => {
  try {
    const student = await User.findByPk(req.params.id, {
      include: [Payment, Result]
    });
    if (!student) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }
    const courses = await Course.findAll();
    const progress = calculateProgress(student, courses);
    return res.json({ student, progress });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listStudents, studentOverview };
