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
        onDelete: 'CASCADE',
        unique: true
      },
      role: {
        type: DataTypes.ENUM('superadmin', 'moderator', 'reviewer'),
        allowNull: false,
        defaultValue: 'moderator'
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Admin',
      tableName: 'Admins',
      timestamps: true
    });
  }

  static associate(models) {
    if (models.User) {
      this.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
    
    if (models.KycDocument) {
      this.hasMany(models.KycDocument, { foreignKey: 'adminId' });
    }
    
    if (models.SupportTicket) {
      this.hasMany(models.SupportTicket, { foreignKey: 'adminId' });
    }
  }
}

module.exports = Admin;
