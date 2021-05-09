/** index.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * HTTP Route index, holds all the routes
 */
const express = require("express");
const cookieParser = require("cookie-parser");

const authentication = require("./authentication/");

const router = express.Router();

// Authentication routes
router.use("/auth", cookieParser(), authentication);

// The rest of the Routes will return a 404 error
router.use('*', (_, res) => {
  res.status(404).send("NOT FOUND");
});

module.exports = router;
