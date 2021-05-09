const dotenv = require("dotenv");
dotenv.config();

const { Pool } = require('pg');

const database = new Pool({
  database: process.env.USERSERVICE_DATABASE,
  host: process.env.USERSERVICE_DB_HOST,
  password: process.env.USERSERVICE_DB_PASSWORD,
  port: process.env.USERSERVICE_DB_PORT,
  user: process.env.USERSERVICE_DB_USER
});

module.exports = database;
