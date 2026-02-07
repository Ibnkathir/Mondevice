const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Result extends Model {}

Result.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "Result",
    tableName: "results"
  }
);

module.exports = Result;
