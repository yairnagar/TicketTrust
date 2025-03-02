const { Model, DataTypes } = require('sequelize');

class EventCheckIn extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      verificationMethod: {
        type: DataTypes.STRING,
        defaultValue: 'qr_code'
      },
      blockchainVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      blockchainUpdateBatchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'BlockchainUpdateBatches',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
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
      modelName: 'EventCheckIn',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Event, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    this.belongsTo(models.Ticket, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
    this.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    this.belongsTo(models.BlockchainUpdateBatch, { foreignKey: 'blockchainUpdateBatchId', as: 'updateBatch', onDelete: 'SET NULL' });
  }
}

module.exports = EventCheckIn;
