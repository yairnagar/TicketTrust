'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MintingBatches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      contractBatchId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ContractBatches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      batchNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'retrying'),
        defaultValue: 'pending'
      },
      ticketCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transactionHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      startTokenId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      endTokenId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      retryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gasUsed: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gasCost: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: true
      },
      blockNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nextRetryAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MintingBatches');
  }
};