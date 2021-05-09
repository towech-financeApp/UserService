/** validator.js
 * Copyright (c) 2020, Jose Tow
 * All rights reserved.
 * 
 * Contains functions that validate data
 */

const database = require("../database/pg");

/** validateEmail
 * Checks if a given string can be used as email
 * 
 * @param email
 * 
 * @returns Valid: Boolean that confirms validity
 * @returns errors: Object with all the errors
 */
module.exports.validateEmail = async (email) => {
  // Creates an object that will hold all the errors
  const errors = {};

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
  if (await database.userExistsByEmail(email)) {
    errors.email = 'e-mail already registered';
  }


  return {
    errors,
    valid: Object.keys(errors).length < 1,
  }
}