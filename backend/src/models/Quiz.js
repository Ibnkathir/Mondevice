const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Quiz extends Model {}

Quiz.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passScore: {
      type: DataTypes.INTEGER,
      defaultValue: 70
    }
  },
  {
    sequelize,
    modelName: "Quiz",
    tableName: "quizzes"
  }
);

module.exports = Quiz;
