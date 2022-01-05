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
import DbUsers from '../database/schemas/dbUsers';
import Mailer from '../utils/mailer';

const register = async (message: any): Promise<AmqpMessage> => {
  // Destrucutres the payload
  const { name, email } = message;
  let { role } = message;

  try {
    let errors = {};

    // Validates the email
    const emailValidation = await Validator.validateEmail(email);
    if (!emailValidation.valid) errors = { ...errors, ...emailValidation.errors };

    // Validates the name
    const nameValidation = await Validator.validateName(name);
    if (!nameValidation.valid) errors = { ...errors, ...nameValidation.errors };

    if (Object.keys(errors).length > 0) return AmqpMessage.errorMessage('Invalid Fields', 422, errors);

    // Sets the role
    if (role.toUpperCase() !== 'ADMIN') role = 'user';

    // Creates a temporary 8 character password
    const password = Math.random().toString(36).substring(2, 10);
    logger.debug(password);

    // Hashes the password
    const hashedPassword = bcrypt.hashSync(password, '');

    const newUser = await DbUsers.add(name.trim(), email.trim(), hashedPassword, role);

    // sends the password via email
    Mailer.registrationEmail(newUser.username, newUser.name, password);

    // removes the password from the newUser before sending it to the API
    newUser.password = undefined;

    const responseMessage = new AmqpMessage(newUser, 'register', 200);

    return responseMessage;
  } catch (err: any) {
    return AmqpMessage.errorMessage(`Unexpected error`, 500, err);
  }
};

export default register;
