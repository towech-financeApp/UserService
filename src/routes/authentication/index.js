/** index.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved
 * 
 * index for all the authetication routes
 */
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const { route } = require("..");

// database
const User = require('../../database/models/user');

// utils
const { checkAdmin, checkRefresh } = require("../../utils/checkAuth");
const errorHandler = require("../../utils/errorhandler");
const generateToken = require("../../utils/generateToken");
const { logoutUser } = require("../../utils/logoutUser");
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

// login: creates a new refresh token and authtoken for the user
router.post("/login", async (req, res) => {
  const { username, password, keepSession } = req.body;

  try {
    // Searches in the database for the user
    const user = await User.findOne({ username });
    if (!user) throw errorHandler.authenticationError({ 'Login Error': { username: "Bad credentials" } });

    // Compares the password
    const valid_password = await bcrypt.compare(password ? password : "", user.password);
    if (!valid_password) throw errorHandler.authenticationError({ 'Login Error': { username: "Bad credentials" } });

    // Creates the tokens
    const refresh_token = generateToken.generateRefreshToken(user, keepSession);
    const auth_token = generateToken.generateAuthToken(user);

    // Adds the refreshToken to the user
    if (keepSession) {
      let newRefreshTokens = user.refreshTokens

      // removes the last used refreshToken if there are more than 5
      if (newRefreshTokens.length >= 5) { newRefreshTokens.shift(); };

      newRefreshTokens.push(refresh_token);

      await User.findByIdAndUpdate(user.id, { refreshTokens: newRefreshTokens });

    } else {
      await User.findByIdAndUpdate(user.id, { singleSessionToken: refresh_token });
    }

    // Sends the refreshToken as cookie
    res.cookie("jid", refresh_token, { httpOnly: true });
    res.send({ token: auth_token });

  }
  catch (exception) { errorHandler.sendHttpError(res, exception); }

});

// refresh_token: if a valid refreshToken is provided, creates a new auhtToken
router.post("/refresh", checkRefresh, async (req, res) => {

  const auth_token = generateToken.generateAuthToken(req.user);

  res.send({ token: auth_token });
});

// logout: if a valid refreshToken is provided, removes the refreshToken from the user
router.post("/logout", checkRefresh, async (req, res) => {

  try {
  
    // Logs out the refreshToken
    await logoutUser(req.user, req.cookies.jid);

    res.sendStatus(204);
  }
  catch (err) { errorHandler.sendHttpError(res, err); }

});

// logout-all: if a valid refreshToken is provided, removes all the tokens from the user
router.post("/logout-all", checkRefresh, async (req, res) => {

  try {
    // Updates the user and removes all tokens
    await logoutUser(req.user);

    res.sendStatus(204);
  }
  catch (err) { errorHandler.sendHttpError(res, err); }

});

module.exports = router;