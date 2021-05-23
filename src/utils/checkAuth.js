/** checkAuth.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved.
 * 
 * Utility that checks if the received authentication token is valid
 */
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

// database
const users = require('../database/models/users');

// utils
const errorhandler = require("./errorhandler");

// Checks if a jwt Token is valid
const isAuth = (token, isRefresh = false) => {

  try {
    const decoded_token = jwt.verify(token, isRefresh ? process.env.USERSERVICE_REFRESH_TOKEN_KEY : process.env.USERSERVICE_AUTH_TOKEN_KEY);
    return decoded_token;
  }
  catch (err) {
    throw errorhandler.authenticationError("Invalid Token", { token: "Invalid Token" });
  }

};

// Checks if the user is an admin or the super user
const isSuperUser = (token) => {
  if (token === process.env.USERSERVICE_SUPERUSER_KEY) { return true; }
  return false;
}

// Middleware that checks if the requester is superUser or admin
module.exports.checkAdmin = (req, res, next) => {
  try {
    // Gets the Authorization header
    const authorization = req.headers["authorization"];
    if (!authorization) { throw errorhandler.authenticationError("No token provided", { authorization: "No token provided" }); };

    // Checks if the token is super user or an admin
    const token = authorization.split(" ")[1];
    if (!isSuperUser(token)) {

      // Decripts the token
      try {
        const decoded_token = isAuth(token);
        if (decoded_token.role !== "admin") {
          throw errorhandler.authenticationError("User is not admin", { role: "User is not admin" });
        }
      }
      catch (err) { throw errorhandler.authenticationError("Invalid token", err) }
    }

    next();
  }
  catch (err) { errorhandler.sendHttpError(res, err); }
};

// Middleware that validates the refreshToken
module.exports.checkRefresh = async (req, res, next) => {
  // Gets the refresh_token from the cookie
  try {
    const refresh_token = req.cookies.jid;
    if (!refresh_token) throw errorhandler.authenticationError("No refresh token", { refresh_token: "No token provided" });

    // Validates the token
    const decoded_token = isAuth(refresh_token, true);

    // Checks if the user still exists
    const user = await users.getById(decoded_token.id);
    if (!user) throw errorhandler.serverError("User deleted", { user: "user deleted" });

    // Checks if the user has the token as still valid
    if (user.singlesessiontoken !== refresh_token && !user.refreshtokens.includes(refresh_token)) {
      throw errorhandler.authenticationError("Invalid token", { refresh_token: "Invalid Token" });
    }

    req.user = user;

    next();

  } catch (exception) { errorhandler.sendHttpError(res, exception); }

};