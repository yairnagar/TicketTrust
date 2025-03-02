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
        },
        onDelete: 'CASCADE'
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      assignedTo: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      relatedEntityId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      relatedEntityType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastResponseDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      resolvedDate: {
        type: DataTypes.DATE,
        allowNull: true
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
      modelName: 'SupportTicket',
      timestamps: true
    });
  }

  static associate(models) {
    SupportTicket.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    SupportTicket.belongsTo(models.Admin, { foreignKey: 'assignedTo', as: 'assignedAdmin', onDelete: 'SET NULL' });
  }
}

module.exports = SupportTicket;
