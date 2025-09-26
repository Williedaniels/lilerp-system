const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('lilerp_db', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.log('📝 Note: Make sure PostgreSQL is running and credentials are correct');
  }
};

testConnection();

module.exports = sequelize;
