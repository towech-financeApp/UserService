/** generateToken.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved.
 * 
 * Creates the login tokens, the token only contains the id of the user
 */
const dotenv = require('dotenv');
dotenv.config();

// Utils
const jwt = require('jsonwebtoken');
const logger = require('./logger');

// creates an authenticationToken
module.exports.generateAuthToken = (user) => {
  return jwt.sign({
    username: user.username,
    id: user.id,
    role: user.role,
  }, process.env.USERSERVICE_AUTH_TOKEN_KEY, {
    expiresIn: "1m",
  });
};

// creates a refreshToken
module.exports.generateRefreshToken = (user, keepSession) => {
  return jwt.sign({
    id: user.id,
  }, process.env.USERSERVICE_REFRESH_TOKEN_KEY, {
    expiresIn: keepSession ? "30d" : "1h",
  });
};
