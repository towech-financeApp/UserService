/** logoutUser.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Utility that removes the refresh tokens from a user if a token is provided,
 * only removes it, otherwise, removes all tokens
 */
const User = require("../database/models/user");

module.exports.logoutUser = async (user, token = null) => {

  let singleSessionToken = "";
  let refreshTokens = [];

  // If a token is provided, only that one is filtered
  if (token) {
    singleSessionToken = (user.singleSessionToken === token) ? "" : user.singleSessionToken;
    refreshTokens = user.refreshTokens.filter(rToken => rToken != token);
  }

  // Updates the user
  await User.findByIdAndUpdate(user.id, { singleSessionToken, refreshTokens });

};