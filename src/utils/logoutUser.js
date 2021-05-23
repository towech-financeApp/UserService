/** logoutUser.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Utility that removes the refresh tokens from a user if a token is provided,
 * only removes it, otherwise, removes all tokens
 */
const users = require('../database/models/users');

module.exports.logoutUser = async (user, token = null) => {

  let singleSessionToken = "";
  let refreshTokens = [];

  // If a token is provided, only that one is removed
  if (token) {
    singleSessionToken = (user.singlesessiontoken === token) ? "" : user.singlesessiontoken;
    refreshTokens = user.refreshtokens.filter(rToken => rToken != token);
  }

  // Updates the user
  await users.logout(user.userid, refreshTokens, singleSessionToken);

};