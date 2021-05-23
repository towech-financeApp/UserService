/** transactions.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Contains all the functions to communicate to the users table
 */
const client = require('../pg');

/** add
 * Adds a user to the DB
 * 
 * @param name
 * @param username
 * @param password
 * @param role
 * 
 * @returns The inserted transaction
 */
module.exports.add = async (name, username, password, role) => {
  const response = await client.query(`INSERT INTO Users(name, username, password, role) VALUES('${name}', '${username}', '${password}', '${role}') RETURNING *`);
  return response.rows[0];
}

/** existsByEmail
 * Checks if a given user exists by the email
 * 
 * @param username
 * 
 * @returns Boolean indicating that exists
 */
module.exports.existsByEmail = async (username) => {
  const response = await client.query(`SELECT * FROM Users WHERE username = '${username}'`);
  return response.rowCount > 0;
};

/** getById
 * Gets the user with the given id
 * 
 * @param userId
 * 
 * @returns The user from the DB
 */
module.exports.getById = async (userId) => {
  const response = await client.query(`SELECT * FROM Users WHERE userid = ${userId}`);

  if (response.rowCount == 0) return null
  return response.rows[0];
}

/** getByEmail
 * Gets the user with the given email
 * 
 * @param {string} username
 * 
 * @returns The user from the DB
 */
module.exports.getByEmail = async (username) => {
  const response = await client.query(`SELECT * FROM Users WHERE username = '${username}'`);

  if (response.rowCount == 0) return null
  return response.rows[0];
};

// TODO: Documentation
module.exports.logout = async (userId, refreshTokens, singleSessionToken) => {
  const response = await client.query(`UPDATE Users SET refreshTokens = '{${refreshTokens}}', singleSessionToken = '${singleSessionToken}' WHERE userId = ${userId} RETURNING *`);
  return response;
};

module.exports.updateRefreshTokens = async (userId, tokens) => {
  const response = await client.query(`UPDATE Users SET refreshTokens = '{${tokens}}' WHERE userId = ${userId} RETURNING *`)
  return response;
};

module.exports.updateSingleSessionToken = async (userId, token) => {
  const response = await client.query(`UPDATE Users SET singleSessionToken = '${token}' WHERE userId = ${userId} RETURNING *`)
  return response;
};
