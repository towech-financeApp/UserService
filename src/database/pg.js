const { Pool } = require('pg');

const database = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: ' ',
  database: 'postgres',
  port: '5432'
});

module.exports = database;
