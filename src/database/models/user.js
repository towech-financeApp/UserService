/** user.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Model that describes the User schema
 */
const mongoose = require("mongoose");

// The Schema doesn't have validators as it is managed differently
const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  role: String,
  accountConfirmed: { type: Boolean, default: false },
  refreshTokens: [String],
  singleSessionToken: String,
  createdAt: String,
});

// Export to database
const User = mongoose.model('Users', UserSchema);

module.exports = User;
