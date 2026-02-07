const { Content } = require("../models");

const listContents = async (req, res, next) => {
  try {
    const contents = await Content.findAll({ where: { levelId: req.params.levelId } });
    return res.json(contents);
  } catch (error) {
    return next(error);
  }
};

const createContent = async (req, res, next) => {
  try {
    const content = await Content.create({ ...req.body, levelId: req.params.levelId });
    return res.status(201).json(content);
  } catch (error) {
    return next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Contenu introuvable" });
    }
    await content.update(req.body);
    return res.json(content);
  } catch (error) {
    return next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Contenu introuvable" });
    }
    await content.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listContents,
  createContent,
  updateContent,
  deleteContent
};
