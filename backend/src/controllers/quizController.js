const { Quiz, Question, Result } = require("../models");

const getQuizForLevel = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      where: { levelId: req.params.levelId },
      include: [Question]
    });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable" });
    }
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { questions, ...quizData } = req.body;
    const quiz = await Quiz.create({ ...quizData, levelId: req.params.levelId });
    if (questions && questions.length) {
      const questionPayload = questions.map((question) => ({ ...question, quizId: quiz.id }));
      await Question.bulkCreate(questionPayload);
    }
    const created = await Quiz.findByPk(quiz.id, { include: [Question] });
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { score, passed } = req.body;
    const result = await Result.create({
      score,
      passed,
      quizId: req.params.quizId,
      userId: req.user.id
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getQuizForLevel, createQuiz, submitQuiz };
