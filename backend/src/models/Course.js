const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Course extends Model {}

Course.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "GNF"
    }
  },
  {
    sequelize,
    modelName: "Course",
    tableName: "courses"
  }
);

module.exports = Course;
