const { Model, DataTypes } = require('sequelize');

class TicketType extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      soldCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      saleStartTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      saleEndTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      maxPerUser: {
        type: DataTypes.INTEGER,
        defaultValue: 10
      },
      benefits: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'sold_out', 'inactive'),
        defaultValue: 'draft'
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      videoUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      seatingInfo: {
        type: DataTypes.JSONB,
        defaultValue: {}
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
      modelName: 'TicketType',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.Event, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    this.hasMany(models.Ticket, { foreignKey: 'typeId' });
  }
}

module.exports = TicketType;