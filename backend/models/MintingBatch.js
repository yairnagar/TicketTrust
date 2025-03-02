const { Model, DataTypes } = require('sequelize');

class MintingBatch extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      contractBatchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ContractBatches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      batchNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'retrying'),
        defaultValue: 'pending'
      },
      ticketCount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      startTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      endTokenId: {
        type: DataTypes.INTEGER,
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
      gasUsed: {
        type: DataTypes.STRING,
        allowNull: true
      },
      gasCost: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: true
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      nextRetryAt: {
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
      modelName: 'MintingBatch',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.ContractBatch, { foreignKey: 'contractBatchId', onDelete: 'CASCADE' });
    this.hasMany(models.Ticket, { foreignKey: 'mintingBatchId' });
  }
}

module.exports = MintingBatch;