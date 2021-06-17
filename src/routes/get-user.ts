/** register.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that returns a requested users
 */
import { AmqpMessage } from 'tow96-amqpwrapper';

// Utils
import DbUsers from '../database/tables/dbUsers';

const getByUsername = async (message: any): Promise<AmqpMessage> => {
  // Destructures the email
  const { username } = message;

  try {
    const user = await DbUsers.getByEmail(username);

    return new AmqpMessage(user, 'get-byUsername', 200);
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

const getById = async (message: any): Promise<AmqpMessage> => {
  // Destructures the email
  const { userid } = message;

  try {
    const user = await DbUsers.getById(userid);

    return new AmqpMessage(user, 'get-byId', 200);
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export { getByUsername, getById };
