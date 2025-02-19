const { Model, DataTypes } = require('sequelize');

class TransactionTicket extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        }
      },
      price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
      transactionType: {
        type: DataTypes.ENUM('initial_purchase', 'secondary_sale'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      }
    }, {
      sequelize,
      modelName: 'TransactionTicket',
      timestamps: true
    });
  }

  static associate(models) {
    TransactionTicket.belongsTo(models.User, { foreignKey: 'buyerId', as: 'buyer' });
    TransactionTicket.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
    TransactionTicket.belongsTo(models.Ticket, { foreignKey: 'ticketId' });
  }
}

module.exports = TransactionTicket;
