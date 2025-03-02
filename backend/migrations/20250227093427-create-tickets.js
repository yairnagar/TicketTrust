'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
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
      typeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'TicketTypes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      mintingBatchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'MintingBatches',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      tokenId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      qrCode: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending_mint', 'minting', 'minted', 'used', 'cancelled'),
        defaultValue: 'pending_mint'
      },
      metadataUri: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isTransferable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      transferCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastTransferDate: {
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
    await queryInterface.dropTable('Tickets');
  }
};