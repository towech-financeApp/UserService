/** get-user.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that returns a requested user
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import logger from 'tow96-logger';

// Utils
import DbUsers from '../database/schemas/dbUsers';

export default class GetUser {
  static byUsername = async (message: any): Promise<AmqpMessage> => {
    logger.http(`get by email: ${message.username}`);

    // Destructures the email
    const { username } = message;

    try {
      const user = await DbUsers.getByEmail(username);

      return new AmqpMessage(user, 'get-byUsername', 200);
    } catch (err: any) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
    }
  };

  static byId = async (message: any): Promise<AmqpMessage> => {
    logger.http(`get by id: ${message._id}`);

    // Destructures the email
    const { _id } = message;

    try {
      const user = await DbUsers.getById(_id);

      return new AmqpMessage(user, 'get-byId', 200);
    } catch (err: any) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
    }
  };

  static getAll = async (): Promise<AmqpMessage> => {
    logger.http(`get all users`);
    try {
      const users = await DbUsers.getAll();

      // Removes sensitive data
      users.map((user: any) => {
        user.password = undefined;
        user.refreshTokens = undefined;
        user.singleSessionToken = undefined;
        user.resetToken = undefined;
      });

      return new AmqpMessage({users}, 'get-users', 200);
    } catch (err: any) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
    }
  };
}
