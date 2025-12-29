const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    define: { timestamps: true, underscored: true }
  }
);

const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log('PostgreSQL connected');
  if (config.env === 'development') await sequelize.sync({ alter: true });
};

module.exports = { sequelize, connectDatabase };
