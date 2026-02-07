const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Content extends Model {}

Content.init(
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
    type: {
      type: DataTypes.ENUM("VIDEO", "AUDIO", "PDF"),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Content",
    tableName: "contents"
  }
);

module.exports = Content;
