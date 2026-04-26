require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging:  process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max:     10,
    min:     0,
    acquire: 30000,
    idle:    10000,
  },
  define: {
    underscored:   true,
    freezeTableName: false,
    timestamps:    true,
  },
});

module.exports = sequelize;
