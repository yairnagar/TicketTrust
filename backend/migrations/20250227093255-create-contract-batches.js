'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContractBatches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      network: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'polygon'
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'deprecated'),
        defaultValue: 'active'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      maxTickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      currentTokenId: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      abi: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      deploymentTxHash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ownerAddress: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('ContractBatches');
  }
};