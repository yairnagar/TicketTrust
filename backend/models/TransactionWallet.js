const { Model, DataTypes } = require('sequelize');

class TransactionWallet extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
      transactionType: {
        type: DataTypes.ENUM('deposit', 'withdrawal'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'TransactionWallet',
      timestamps: true
    });
  }

  static associate(models) {
    TransactionWallet.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  }
}

module.exports = TransactionWallet;
