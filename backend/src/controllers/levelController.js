const { Level } = require("../models");

const listLevels = async (req, res, next) => {
  try {
    const levels = await Level.findAll({ where: { courseId: req.params.courseId } });
    return res.json(levels);
  } catch (error) {
    return next(error);
  }
};

const createLevel = async (req, res, next) => {
  try {
    const level = await Level.create({ ...req.body, courseId: req.params.courseId });
    return res.status(201).json(level);
  } catch (error) {
    return next(error);
  }
};

const updateLevel = async (req, res, next) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }
    await level.update(req.body);
    return res.json(level);
  } catch (error) {
    return next(error);
  }
};

const deleteLevel = async (req, res, next) => {
  try {
    const level = await Level.findByPk(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }
    await level.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listLevels,
  createLevel,
  updateLevel,
  deleteLevel
};
