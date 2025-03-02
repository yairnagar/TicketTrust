const { Model, DataTypes } = require('sequelize');

class Event extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      organizerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Organizers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
        defaultValue: 'draft'
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ticketingStatus: {
        type: DataTypes.ENUM('draft', 'on_sale', 'paused', 'ended'),
        defaultValue: 'draft'
      },
      contractBatchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'ContractBatches',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      totalTickets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      soldTickets: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      venueDetails: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      doorsOpenTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      attendeeInstructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      cancellationPolicy: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      allowResale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      ageRestriction: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      contactInfo: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      allowEarlyCheckIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      lateCheckInWindow: {
        type: DataTypes.INTEGER,
        defaultValue: 120
      },
      allowTicketTransfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
      modelName: 'Event',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Organizer, { foreignKey: 'organizerId', as: 'organizer', onDelete: 'CASCADE' });
    this.hasMany(models.TicketType, { foreignKey: 'eventId' });
    this.hasMany(models.Ticket, { foreignKey: 'eventId' });
    this.belongsTo(models.ContractBatch, { foreignKey: 'contractBatchId', onDelete: 'SET NULL' });
    this.hasMany(models.EventCheckIn, { foreignKey: 'eventId' });
  }
}

module.exports = Event;
