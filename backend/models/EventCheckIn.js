const { Model, DataTypes } = require('sequelize');

class EventCheckIn extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        }
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        unique: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      checkInTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'EventCheckIn',
      timestamps: true
    });
  }

  static associate(models) {
    EventCheckIn.belongsTo(models.Event, { foreignKey: 'eventId' });
    EventCheckIn.belongsTo(models.Ticket, { foreignKey: 'ticketId' });
    EventCheckIn.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = EventCheckIn;
