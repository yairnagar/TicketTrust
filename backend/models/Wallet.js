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
        onDelete: 'CASCADE',
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
      modelName: 'Wallet',
      timestamps: true
    });
  }

  static associate(models) {
    Wallet.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  }
}

module.exports = Wallet;
