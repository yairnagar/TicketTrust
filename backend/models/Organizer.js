const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
      companyRegistrationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      companyAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isUrl: true }
      },
      companyDescription: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      contactPersonName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true }
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      verificationStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      submissionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isUrl: true }
      },
      socialLinks: {
        type: DataTypes.JSONB, // אחסון רשימה של קישורים לרשתות חברתיות
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Organizer',
      timestamps: true
    });
  }

  static associate(models) {
    Organizer.belongsTo(models.User, { foreignKey: 'userId' });
    Organizer.hasMany(models.Event, { foreignKey: 'organizerId' });
    Organizer.hasMany(models.KycDocument, { foreignKey: 'organizerId' });
  }
}

module.exports = Organizer;
