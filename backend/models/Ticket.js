const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Ticket extends Model {
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
      typeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'TicketTypes',
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
      mintingBatchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'MintingBatches',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      tokenId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      qrCode: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending_mint', 'minting', 'minted', 'used', 'cancelled'),
        defaultValue: 'pending_mint'
      },
      metadataUri: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isTransferable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      transferCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastTransferDate: {
        type: DataTypes.DATE,
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
      modelName: 'Ticket',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Event, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    this.belongsTo(models.TicketType, { foreignKey: 'typeId', onDelete: 'CASCADE' });
    this.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    this.belongsTo(models.MintingBatch, { foreignKey: 'mintingBatchId', onDelete: 'SET NULL' });
    this.hasOne(models.EventCheckIn, { foreignKey: 'ticketId' });
    this.hasMany(models.TransactionTicket, { foreignKey: 'ticketId' });
  }
}

module.exports = Ticket;
