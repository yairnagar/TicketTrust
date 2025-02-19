require('dotenv').config();
const { Sequelize } = require('sequelize');

// יצירת חיבור למסד הנתונים
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // אופציונלי - מבטל את הלוגים של SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// בדיקת החיבור למסד הנתונים
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connection to database has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

// לא מחזירים את `sequelize` ישירות, אלא אובייקט שמתאים ל`sequelize-cli`
module.exports = sequelize;
