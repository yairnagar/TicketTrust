const { Model, DataTypes } = require('sequelize');

class TransactionTicket extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        }
      },
      buyerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'canceled'), // 🔄 הוספת canceled
        allowNull: false,
        defaultValue: 'pending'
      },
      transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'TransactionTicket',
      timestamps: true
    });
  }

  static associate(models) {
    TransactionTicket.belongsTo(models.Ticket, { foreignKey: 'ticketId' });
    TransactionTicket.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' });
    TransactionTicket.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
  }
}

module.exports = TransactionTicket;
