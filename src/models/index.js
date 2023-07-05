const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.URCDB, dbConfig.URCUSER, dbConfig.URCPASSWORD, {
  host: dbConfig.URCHOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.AdminModel = require("./AdminModel.js")(sequelize, Sequelize);
db.AppCredsModel = require("./AppCredsModel.js")(sequelize, Sequelize);

module.exports = db;