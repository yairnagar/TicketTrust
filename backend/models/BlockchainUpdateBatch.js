const { Model, DataTypes } = require('sequelize');

class BlockchainUpdateBatch extends Model {
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
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'retrying'),
        defaultValue: 'pending'
      },
      ticketCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updateType: {
        type: DataTypes.ENUM('check_in', 'invalidate', 'other'),
        defaultValue: 'check_in'
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
      modelName: 'BlockchainUpdateBatch',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Event, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    this.hasMany(models.EventCheckIn, { foreignKey: 'blockchainUpdateBatchId' });
  }
}

module.exports = BlockchainUpdateBatch; 