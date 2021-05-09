const dotenv = require("dotenv");
dotenv.config();

const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.USERSERVICE_DATABASE,
  host: process.env.USERSERVICE_DB_HOST,
  password: process.env.USERSERVICE_DB_PASSWORD,
  port: process.env.USERSERVICE_DB_PORT,
  user: process.env.USERSERVICE_DB_USER
});



const addUser = async(name, username, password, role) => {
  const response = await pool.query(`INSERT INTO Users(name, username, password, role) VALUES('${name}', '${username}', '${password}', '${role}') RETURNING *`);
  return response.rows[0];
}

const getUserByEmail = async(username) => {
  const response = await pool.query(`SELECT * FROM Users WHERE username = '${username}'`);
  return response.rows[0];
};

const updateRefreshTokens = async(userId, tokens) => {
  const response = await pool.query(`UPDATE Users SET refreshTokens = '{${tokens}}' WHERE userId = ${userId} RETURNING *`)
  return response;
};

const updateSingleSessionToken = async(userId, token) => {
  const response = await pool.query(`UPDATE Users SET singleSessionToken = '${token}' WHERE userId = ${userId} RETURNING *`)
  return response;
}

const userExistsByEmail = async(username) => {
  const response = await pool.query(`SELECT * FROM Users WHERE username = '${username}'`);
  return response.rowCount > 0;
};


module.exports = {
  addUser,
  getUserByEmail,
  updateRefreshTokens,
  updateSingleSessionToken,
  userExistsByEmail,
}
