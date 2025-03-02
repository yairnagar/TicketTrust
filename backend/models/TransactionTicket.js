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
        },
        onDelete: 'CASCADE'
      },
      fromUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      toUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      transactionType: {
        type: DataTypes.ENUM('purchase', 'transfer', 'resale'),
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      blockchainTxHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gasUsed: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gasCost: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
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
      modelName: 'TransactionTicket',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Ticket, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
    this.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser', onDelete: 'SET NULL' });
    this.belongsTo(models.User, { foreignKey: 'toUserId', as: 'toUser', onDelete: 'CASCADE' });
  }
}

module.exports = TransactionTicket;
