/** edit-User.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that changes the contents of a user
 */
import { AmqpMessage } from 'tow96-amqpwrapper';
import logger from 'tow96-logger';
import DbUsers from '../database/schemas/dbUsers';

// Models
import { User } from '../Models';
import Validator from '../utils/validator';

const editUser = async (message: User): Promise<AmqpMessage> => {
  logger.http(`Edit user: ${JSON.stringify(message)}`);

  try {
    let errors: any = {};
    const content: any = {};

    // Validation
    if (message.name) {
      const nameValidation = await Validator.validateName(message.name);
      if (!nameValidation.valid) errors = { ...errors, ...nameValidation.errors };
      else {
        const dbuser = await DbUsers.getById(message._id);
        if (!dbuser) errors.user = `Invalid user`;
        else if (dbuser.name !== message.name.trim()) content.name = message.name.trim();
      }
    }

    // If there is an error, it gets thrown
    if (Object.keys(errors).length > 0) return AmqpMessage.errorMessage('Invalid Fields', 422, errors);

    // If there aren't any changes, returns a 304 code
    if (Object.keys(content).length < 1) return new AmqpMessage(null, 'edit-User', 304);

    // Updates the transaction
    const updatedUser = await DbUsers.updateUser(message._id, content);

    // removes the password and the tokens before sending the response
    updatedUser.password = undefined;
    updatedUser.refreshTokens = [];
    updatedUser.singleSessionToken = undefined;

    return new AmqpMessage(updatedUser, 'edit-User', 200);
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export default editUser;
