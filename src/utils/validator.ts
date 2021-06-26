/** validator.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Class that contains functions that validate data
 */
import logger from 'tow96-logger';
import User from '../database/schemas/dbUsers';

export default class Validator {
  static validateEmail = async (email: string): Promise<{ valid: boolean; errors: any }> => {
    const errors: any = {};

    // Checks if email is not empty and is valid
    if (!email || email.trim() === '') {
      errors.email = 'e-mail must not be empty';
    } else {
      const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@[0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9}$/;
      if (!email.match(regEx)) {
        errors.email = 'e-mail must be a valid address';
      }
    }

    // Checks the DB to see if the user already exists
    if (await User.getByEmail(email)) errors.email = 'e-mail already registered';

    return {
      errors,
      valid: Object.keys(errors).length < 1,
    };
  };
}
