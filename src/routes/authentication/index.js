/** index.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved
 * 
 * index for all the authetication routes
 */
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");

// database
const User = require('../../database/models/user');

// utils
const { checkAdmin } = require("../../utils/checkAuth");
const errorHandler = require("../../utils/errorhandler");
const { validateEmail } = require("../../utils/validator");

const router = express.Router();

// register: creates a new user only admins and the superUser are allowed to create users
router.post("/register", checkAdmin, async (req, res) => {
  const { name, email, role } = req.body;

  try {
    // Validates the email
    const { valid, errors } = validateEmail(email);
    if (!valid) throw errorHandler.userInputError('Invalid fields', errors);

    // Checks for user availability, if it already exists, sends an error
    const userExists = await User.findOne({ username: email });
    if (userExists) throw errorHandler.userInputError('Taken username', { username: 'This username is taken' });

    // Sets the role for the user
    let userRole = "user";
    if (role) { if (role.toUpperCase() === "ADMIN") { userRole = "admin" }; }

    // Creates a temporary 8 character password
    const password = Math.random().toString(36).substring(2, 10);

    // Hashes the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Adds the new User to the database
    const newUser = await new User({
      name: name,
      username: email,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date().toISOString(),
    }).save();

    // TODO: send the password via email

    const payload = { 
      id: newUser.id,
    }

    res.send(payload);
  }
  catch (exception) { errorHandler.sendHttpError(res, exception); }
});

router.get("/test", async (req, res) => {
  const token = await jwt.sign("testo", process.env.AUTH_TOKEN_KEY);

  res.send(token);
})

module.exports = router;