/** change-Email.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved.
 *
 * Function that changes the email of a user
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import logger from 'tow96-logger';
import DbUsers from '../database/schemas/dbUsers';
import Mailer from '../utils/mailer';
import Validator from '../utils/validator';

interface Message {
  user_id: string;
  email: string;
  token: string;
}

export default class changeEmail {
  static setNew = async (message: Message): Promise<AmqpMessage> => {
    logger.http(`change email: ${message.user_id}`);

    try {
      const dbUser = await DbUsers.getById(message.user_id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      // Validates the new email
      const { valid, errors } = await Validator.validateEmail(message.email);
      if (!valid) return AmqpMessage.errorMessage(`Invalid email`, 422, errors);

      // If valid, inserts the email
      await DbUsers.updateEmail(message.user_id, message.email.trim());

      // Sends the verification email
      Mailer.accountVerification(dbUser.name, message.email, message.token);

      return new AmqpMessage(null, 'change-email', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  static resendEmail = async (message: Message): Promise<AmqpMessage> => {
    try {
      const dbUser = await DbUsers.getById(message.user_id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      Mailer.accountVerification(dbUser.name, dbUser.username, message.token);

      return new AmqpMessage(null, 'resend-emailVerify', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  static updateVerification = async (message: Message): Promise<AmqpMessage> => {
    try {
      logger.debug(`updating verification for user: ${message.user_id}`);

      const db_user = await DbUsers.getById(message.user_id);

      // Only updates if not already confirmed
      if (!db_user.accountConfirmed) await DbUsers.updateAccountConfirmed(message.user_id);

      return new AmqpMessage(null, 'verify-client', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };
}
