/** App.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * File that manages the connection to the DB and runs queries
 */
import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import logger from 'tow96-logger';
import { AmqpMessage } from 'tow96-amqpwrapper';

// Connects to the DB
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgre: @database/postgre');
client
  .connect()
  .then(() => logger.info('Connected to database'))
  .catch((err) => {
    if (process.env.USERSERVICE_DATABASE_URL) {
      logger.error(`${err}`);
      logger.info('Process exited with code 1');
    } else {
      logger.error('No Postgres url provided, exiting with error 1');
    }
    process.exit(1);
  });

// Sends a query to the DB
const Query = async (query: string): Promise<pg.QueryResult> => {
  try {
    const response = await client.query(query);
    return response;
  } catch (e: any) {
    throw AmqpMessage.errorMessage('Database error', 500, e);
  }
};

export default Query;
