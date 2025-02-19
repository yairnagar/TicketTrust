const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Ticket extends Model {
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
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      nftTokenId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      ticketType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'sold', 'checked-in'),
        defaultValue: 'active'
      }
    }, {
      sequelize,
      modelName: 'Ticket',
      timestamps: true
    });
  }

  static associate(models) {
    Ticket.belongsTo(models.Event, { foreignKey: 'eventId' });
    Ticket.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    Ticket.hasOne(models.EventCheckIn, { foreignKey: 'ticketId' });
  }
}

module.exports = Ticket;
