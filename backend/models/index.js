const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// יצירת חיבור למסד הנתונים
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tickettrust',
  logging: false // אופציונלי - מבטל את הלוגים של SQL
});

const db = {};

// טעינת כל המודלים בתיקייה
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    console.log(`📂 Loading model: ${file}`);
    const model = require(path.join(__dirname, file));

    if (typeof model.init === 'function') {
      console.log(`🔄 Initializing model: ${file}`);
      model.init(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } else {
      console.error(`❌ Model ${file} does not have an init function!`);
    }
  });

// הפעלת כל הקשרים בין המודלים (associations)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`🔗 Setting up associations for ${modelName}`);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
