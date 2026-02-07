const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Question extends Model {}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Question",
    tableName: "questions"
  }
);

module.exports = Question;
