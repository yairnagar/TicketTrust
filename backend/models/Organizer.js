const { Model, DataTypes } = require('sequelize');

class Organizer extends Model {
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
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      businessLicense: {
        type: DataTypes.STRING,
        unique: true
      },
      websiteUrl: {
        type: DataTypes.TEXT
      },
      kycDocumentUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      kycStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      approvedByAdmin: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'Organizer',
      timestamps: true
    });
  }

  static associate(models) {
    Organizer.belongsTo(models.User, { foreignKey: 'userId' });
    Organizer.belongsTo(models.User, { foreignKey: 'approvedByAdmin', as: 'admin' });
    Organizer.hasMany(models.Event, { foreignKey: 'organizerId' });
  }
}

module.exports = Organizer;
