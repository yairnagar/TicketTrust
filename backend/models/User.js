const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      userType: {
        type: DataTypes.ENUM('regular', 'organizer'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'banned', 'suspended'),
        defaultValue: 'active'
      }
    }, {
      sequelize,
      modelName: 'User',
      timestamps: true
    });
  }

  static associate(models) {
    User.hasOne(models.Wallet, { foreignKey: 'userId' });
    User.hasOne(models.Organizer, { foreignKey: 'userId' });
    User.hasMany(models.Ticket, { foreignKey: 'ownerId', as: 'ownedTickets' });
    User.hasMany(models.Notification, { foreignKey: 'userId' });
    User.hasMany(models.SupportTicket, { foreignKey: 'userId' });
    User.hasMany(models.TransactionWallet, { foreignKey: 'userId' });
    User.hasMany(models.TransactionTicket, { foreignKey: 'buyerId', as: 'purchases' });
    User.hasMany(models.TransactionTicket, { foreignKey: 'sellerId', as: 'sales' });
    User.hasMany(models.Marketplace, { foreignKey: 'sellerId', as: 'listings' });
    User.hasMany(models.EventCheckIn, { foreignKey: 'userId' });
  }
}

module.exports = User;
