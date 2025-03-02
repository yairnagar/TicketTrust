'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      organizerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organizers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      eventName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'cancelled', 'completed'),
        defaultValue: 'draft'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ticketingStatus: {
        type: Sequelize.ENUM('draft', 'on_sale', 'paused', 'ended'),
        defaultValue: 'draft'
      },
      contractBatchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'ContractBatches',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      totalTickets: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      soldTickets: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      venueDetails: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      doorsOpenTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      attendeeInstructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancellationPolicy: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      allowResale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ageRestriction: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      contactInfo: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      allowEarlyCheckIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lateCheckInWindow: {
        type: Sequelize.INTEGER,
        defaultValue: 120
      },
      allowTicketTransfer: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('Events');
  }
};