const dotenv = require("dotenv");
dotenv.config();

const pg = require('pg');
const logger = require('../utils/logger');
const { serverError } = require('../utils/errorhandler');

const client = new pg.Client(process.env.USERSERVICE_DATABASE_URL);
client.connect()
  .then(() => logger.info('Connected to database'))
  .catch((err) => {
    if (process.env.USERSERVICE_DATABASE_URL) {
      logger.error(`${err}`);
      logger.info('Process exited with code 1');
    } else {
      logger.error('No Postgres url provided, exiting with error 1')
    }
    process.exit(1);
  });

module.exports.query = async (query) => {
  try {
    const response = await client.query(query);
    return response
  }
  catch (exception) { throw serverError('Database error', exception) }
}
