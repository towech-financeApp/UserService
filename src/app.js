/** App.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 * 
 * Main file for the Backend, establishes the connections and middleware
 */

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");

const routes = require("./routes/index");

const app = express();

// Settings
app.set("port", process.env.PORT || 3000);

// Middleware

// use JSON bodyparser
app.use(express.json());

//morgan: allows the console to provide http protocol logs (only outside of production)
if (process.env.NODE_ENV !== "production") { app.use(morgan("dev")); };

// CORS: enabled on the env file
if (process.env.ENABLE_CORS == "true") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-refresh-token, x-auth-token");

    // Provide pre-flight authorization
    if ("OPTIONS" === req.method) { res.sendStatus(204); }
    else { next(); }
  });
  console.log("CORS enabled");
}

// Setup routes
app.use('/', routes);

// Start server
app.listen(app.get("port"), () => {
  console.log(`Server running on port: ${app.get("port")}`);
});
