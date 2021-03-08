/** mongoose.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved.
 * 
 * Process that connects to the database
 */
 const mongoose = require('mongoose');

 const logger = require('../utils/logger');
 
 mongoose.Promise = global.Promise;
 
 mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
   .then(() => logger.info('Connected to database'))
   .catch((err) => {
     if (process.env.MONGO_URL) {
       logger.error(`${err}`);
       logger.info('Process exited with code 1');
     } else {
       logger.error('No Mongo url provided, exiting with error 1')
     }
     process.exit(1);
   });

 module.exports = mongoose;
 