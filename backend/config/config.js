require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'ticketrust_user',
    password: process.env.DB_PASSWORD || '6587',
    database: process.env.DB_NAME || 'ticketrust_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres', // חובה להגדיר דיאלקט בצורה הזו
    port: process.env.DB_PORT || 5432,
    logging: false,
  },
  test: {
    username: process.env.DB_USER || 'ticketrust_user',
    password: process.env.DB_PASSWORD || '6587',
    database: process.env.DB_NAME || 'ticketrust_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  },
  production: {
    username: process.env.DB_USER || 'ticketrust_user',
    password: process.env.DB_PASSWORD || '6587',
    database: process.env.DB_NAME || 'ticketrust_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
};
