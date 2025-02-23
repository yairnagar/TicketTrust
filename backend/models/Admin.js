const { Model, DataTypes } = require('sequelize');

class Admin extends Model {
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
        unique: true
      },
      role: {
        type: DataTypes.ENUM('superadmin', 'moderator', 'reviewer'),
        allowNull: false,
        defaultValue: 'moderator'
      },
      permissions: {
        type: DataTypes.JSONB, // כדי לאפשר מתן הרשאות פרטניות
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Admin',
      timestamps: true
    });
  }

  static associate(models) {
    Admin.belongsTo(models.User, { foreignKey: 'userId' });
    Admin.hasMany(models.KycDocument, { foreignKey: 'adminId' });
    Admin.hasMany(models.SupportTicket, { foreignKey: 'adminId' });

  }
}

module.exports = Admin;
