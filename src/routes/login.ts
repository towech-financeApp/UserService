/** register.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that stores the given tokens
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import logger from 'tow96-logger';

// Utils
import DbUsers from '../database/tables/dbUsers';
import { User } from '../Models';

const login = async (message: User): Promise<AmqpMessage> => {
  try {
    const user = await DbUsers.login(message);
    return new AmqpMessage(user, 'login', 200);
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export default login;
