const { Model, DataTypes } = require('sequelize');

class Notification extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('system', 'event', 'support', 'wallet', 'ticket'),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'Notification',
      timestamps: true
    });
  }

  static associate(models) {
    Notification.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = Notification;
