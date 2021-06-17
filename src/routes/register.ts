/** register.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Function that processes the registration of users
 */

import { AmqpMessage } from 'tow96-amqpwrapper';
import bcrypt from 'bcrypt-nodejs';
import logger from 'tow96-logger';

// Utils
import Validator from '../utils/validator';
import DbUsers from '../database/tables/dbUsers';

const register = async (message: any): Promise<AmqpMessage> => {
  // Destrucutres the payload
  const { name, email,} = message;
  let { role, } = message;

  try {
    // Validates the email
    const emailValidation = await Validator.validateEmail(email);
    if (!emailValidation.valid) return AmqpMessage.errorMessage('Invalid fields', 422, emailValidation.errors);

    // Sets the role
    if (role.toUpperCase() !== 'ADMIN') role = 'user';

    // Creates a temporary 8 character password
    const password = Math.random().toString(36).substring(2, 10);
    logger.debug(password);

    // Hashes the password
    const hashedPassword = bcrypt.hashSync(password, '');

    const newUser = await DbUsers.add(name.trim(), email.trim(), hashedPassword, role);

    // removes the password from the newUser before sending it
    newUser.password = undefined;

    // TODO: send the password via email

    const responseMessage = new AmqpMessage(newUser, 'register', 200);

    return responseMessage;
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export default register;
