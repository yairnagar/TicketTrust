const { Model, DataTypes } = require('sequelize');

class SupportTicket extends Model {
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
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'SupportTicket',
      timestamps: true
    });
  }

  static associate(models) {
    SupportTicket.belongsTo(models.User, { foreignKey: 'userId' });
    SupportTicket.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
  }
}

module.exports = SupportTicket;
