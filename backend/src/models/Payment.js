const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("PAID", "PENDING", "FAILED"),
      defaultValue: "PENDING"
    },
    lengoPayReference: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments"
  }
);

module.exports = Payment;
