const { sequelize } = require('../server');

beforeAll(async () => {
  // Sync database and create tables
  await sequelize.sync({ force: true }); // force: true drops existing tables
  console.log('✅ Test database initialized');
});

afterAll(async () => {
  // Close database connection after all tests
  await sequelize.close();
  console.log('✅ Test database connection closed');
});