/** change-Password.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved.
 *
 * Function that changes the password of a user
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import logger from 'tow96-logger';
import DbUsers from '../database/schemas/dbUsers';
import Mailer from '../utils/mailer';

interface Message {
  id: string;
  token: string | undefined;
}

export default class resetPassword {
  // Sets the reset-password token it also can remove it, this ensures theres only one password reset token at a time
  static set = async (message: Message): Promise<AmqpMessage> => {
    logger.http(`reset password: ${message.id}`);
    try {
      // Stores the reset token
      const user = await DbUsers.setResetToken(message.id, message.token);

      // If a token was sent instead of being deleted, Sends the email
      if (message.token) Mailer.resetPasswordEmail(user, message.token);

      return new AmqpMessage(null, 'reset-password', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };
}
