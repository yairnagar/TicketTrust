const { Model, DataTypes } = require('sequelize');

class ContractBatch extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      network: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'polygon'
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deprecated'),
        defaultValue: 'active'
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      maxTickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      currentTokenId: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      abi: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      deploymentTxHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ownerAddress: {
        type: DataTypes.STRING,
        allowNull: false
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
      modelName: 'ContractBatch',
      tableName: 'ContractBatches',
      timestamps: true
    });
  }

  static associate(models) {
    this.hasMany(models.Event, { foreignKey: 'contractBatchId' });
    this.hasMany(models.MintingBatch, { foreignKey: 'contractBatchId' });
  }
}

module.exports = ContractBatch;