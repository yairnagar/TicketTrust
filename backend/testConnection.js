const sequelize = require('./config/database');

async function testConnection() {
  try {
    await sequelize.authenticate(); // מאמת חיבור למסד הנתונים
    console.log('✅ Connection to database successful!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testConnection();
