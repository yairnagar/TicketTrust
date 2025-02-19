const { Model, DataTypes } = require('sequelize');

class Marketplace extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        unique: true
      },
      price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('listed', 'sold', 'cancelled'),
        defaultValue: 'listed'
      }
    }, {
      sequelize,
      modelName: 'Marketplace',
      timestamps: true
    });
  }

  static associate(models) {
    Marketplace.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
    Marketplace.belongsTo(models.Ticket, { foreignKey: 'ticketId' });
  }
}

module.exports = Marketplace;
