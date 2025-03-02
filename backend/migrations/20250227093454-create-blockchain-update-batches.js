'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlockchainUpdateBatches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'retrying'),
        defaultValue: 'pending'
      },
      ticketCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      transactionHash: {
        type: Sequelize.STRING,
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
      updateType: {
        type: Sequelize.ENUM('check_in', 'invalidate', 'other'),
        defaultValue: 'check_in'
      },
      gasUsed: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gasCost: {
        type: Sequelize.DECIMAL(18, 8),
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
    await queryInterface.dropTable('BlockchainUpdateBatches');
  }
};