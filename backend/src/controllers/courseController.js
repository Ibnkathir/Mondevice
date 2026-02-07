const { Course } = require("../models");

const listCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll();
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }
    await course.update(req.body);
    return res.json(course);
  } catch (error) {
    return next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }
    await course.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
