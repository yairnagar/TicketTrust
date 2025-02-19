const { Model, DataTypes } = require('sequelize');

class Wallet extends Model {
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
        unique: true
      },
      blockchainAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      balance: {
        type: DataTypes.DECIMAL(18, 8),
        defaultValue: 0
      }
    }, {
      sequelize,
      modelName: 'Wallet',
      timestamps: true
    });
  }

  static associate(models) {
    Wallet.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = Wallet;
