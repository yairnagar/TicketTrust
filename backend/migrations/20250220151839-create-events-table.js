'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      eventDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ticketPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalTickets: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      soldTickets: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM(
          'music', 
          'theater', 
          'sports', 
          'art', 
          'education',
          'food',
          'other'
        ),
        allowNull: false
      },
      ageRestriction: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Events');
  }
};