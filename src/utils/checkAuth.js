/** checkAuth.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved.
 * 
 * Utility that checks if the received authentication token is valid
 */
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

// utils
const errorhandler = require("./errorhandler");

// Checks if a jwt Token is valid
const isAuth = (token, isRefresh = false) => {

  try {
    const decoded_token = jwt.verify(token, isRefresh ? process.env.REFRESH_TOKEN_KEY : process.env.AUTH_TOKEN_KEY);
    return decoded_token;
  }
  catch (err) {
    throw err;
  }

};

// Checks if the user is an admin or the super user
const isSuperUser = (token) => {
  if (token === process.env.SUPERUSER_KEY) { return true; }
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
