const { Model, DataTypes } = require('sequelize');

class KycDocument extends Model {
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
        },
        onDelete: 'CASCADE'
      },
      documentPaths: {
        type: DataTypes.JSONB, // רשימה של מסמכים
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Admins',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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
      modelName: 'KycDocument',
      timestamps: true
    });
  }

  static associate(models) {
    KycDocument.belongsTo(models.Organizer, { foreignKey: 'organizerId', onDelete: 'CASCADE' });
    KycDocument.belongsTo(models.Admin, { foreignKey: 'adminId', onDelete: 'SET NULL' });
  }
}

module.exports = KycDocument;
