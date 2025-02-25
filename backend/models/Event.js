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
        }
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      eventDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      location: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        validate: {
          hasRequiredFields(value) {
            const required = ['city', 'address', 'venue'];
            if (!required.every(field => Object.keys(value).includes(field))) {
              throw new Error('Location must include city, address and venue');
            }
          }
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      ticketPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      totalTickets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      soldTickets: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          isAfterStart(value) {
            if (value <= this.startTime) {
              throw new Error('End time must be after start time');
            }
          }
        }
      },
      category: {
        type: DataTypes.ENUM(
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
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 21
        }
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      }
    }, {
      sequelize,
      modelName: 'Event',
      timestamps: true,
      hooks: {
        beforeValidate: (event) => {
          if (event.soldTickets > event.totalTickets) {
            throw new Error('Sold tickets cannot exceed total tickets');
          }
        }
      }
    });
  }

  static associate(models) {
    Event.belongsTo(models.Organizer, { 
      foreignKey: 'organizerId', 
      as: 'organizer' 
    });
    Event.hasMany(models.Ticket, { 
      foreignKey: 'eventId',
      as: 'tickets'
    });
    Event.hasMany(models.EventCheckIn, { 
      foreignKey: 'eventId',
      as: 'checkIns'
    });
  }
}

module.exports = Event;
