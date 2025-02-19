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
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending'
      }
    }, {
      sequelize,
      modelName: 'Event',
      timestamps: true
    });
  }

  static associate(models) {
    Event.belongsTo(models.Organizer, { foreignKey: 'organizerId', as: 'organizer' });
    Event.hasMany(models.Ticket, { foreignKey: 'eventId' });
    Event.hasMany(models.EventCheckIn, { foreignKey: 'eventId' });
  }
}

module.exports = Event;
