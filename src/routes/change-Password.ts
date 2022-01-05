/** change-Password.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved.
 *
 * Function that changes the password of a user
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import bcrypt from 'bcrypt-nodejs';
import logger from 'tow96-logger';
import DbUsers from '../database/schemas/dbUsers';

interface Message {
  user_id: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const changePassword = async (message: Message): Promise<AmqpMessage> => {
  logger.http(`change password: ${message.user_id}`);

  try {
    const dbUser = await DbUsers.getById(message.user_id);

    // Confirms that the user still exists
    if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

    // Validates that the provided old password is correct
    const validOldPassword = await bcrypt.compareSync(message.oldPassword, dbUser.password || '');
    if (!validOldPassword) return AmqpMessage.errorMessage(`Invalid password`, 403);

    // Confirms that the new password and the confirmPassword are the same
    const validNewPassword = message.newPassword === message.confirmPassword;
    if (!validNewPassword) return AmqpMessage.errorMessage(`Passwords are not the same`, 422);

    // Hashes and changes the new password
    const hashedPassword = bcrypt.hashSync(message.newPassword, '');
    await DbUsers.changePassword(message.user_id, hashedPassword);

    return new AmqpMessage(null, 'change-Password', 204);
  } catch (e) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
  }
};

export default changePassword;
