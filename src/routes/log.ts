/** log.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that stores the given tokens
 */
import { AmqpMessage } from 'tow96-amqpwrapper';

// Utils
import DbUsers from '../database/schemas/dbUsers';
import { User } from '../Models';

const log = async (message: User): Promise<AmqpMessage> => {
  try {
    const user = await DbUsers.updateTokens(message);
    return new AmqpMessage(user, 'login', 200);
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export default log;
