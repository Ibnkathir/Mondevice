const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "ETUDIANT"),
      defaultValue: "ETUDIANT"
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users"
  }
);

module.exports = User;
