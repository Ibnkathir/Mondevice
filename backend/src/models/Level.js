const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Level extends Model {}

Level.init(
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
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Level",
    tableName: "levels"
  }
);

module.exports = Level;
