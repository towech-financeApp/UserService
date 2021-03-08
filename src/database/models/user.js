/** user.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Model that describes the User schema
 */
const mongoose = require("mongoose");

// The Schema doesn't have validators as it is managed differently
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  refreshTokens: [String],
  singleSessionToken: String,
});

// Export to database
const User = mongoose.model('Users', UserSchema);

module.exports = User;
