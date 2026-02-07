const User = require("./User");
const Course = require("./Course");
const Level = require("./Level");
const Content = require("./Content");
const Quiz = require("./Quiz");
const Question = require("./Question");
const Result = require("./Result");
const Payment = require("./Payment");

Course.hasMany(Level, { foreignKey: "courseId", onDelete: "CASCADE" });
Level.belongsTo(Course, { foreignKey: "courseId" });

Level.hasMany(Content, { foreignKey: "levelId", onDelete: "CASCADE" });
Content.belongsTo(Level, { foreignKey: "levelId" });

Level.hasOne(Quiz, { foreignKey: "levelId", onDelete: "CASCADE" });
Quiz.belongsTo(Level, { foreignKey: "levelId" });

Quiz.hasMany(Question, { foreignKey: "quizId", onDelete: "CASCADE" });
Question.belongsTo(Quiz, { foreignKey: "quizId" });

User.hasMany(Result, { foreignKey: "userId", onDelete: "CASCADE" });
Result.belongsTo(User, { foreignKey: "userId" });

Quiz.hasMany(Result, { foreignKey: "quizId", onDelete: "CASCADE" });
Result.belongsTo(Quiz, { foreignKey: "quizId" });

User.hasMany(Payment, { foreignKey: "userId", onDelete: "CASCADE" });
Payment.belongsTo(User, { foreignKey: "userId" });

Course.hasMany(Payment, { foreignKey: "courseId", onDelete: "CASCADE" });
Payment.belongsTo(Course, { foreignKey: "courseId" });

module.exports = {
  User,
  Course,
  Level,
  Content,
  Quiz,
  Question,
  Result,
  Payment
};
