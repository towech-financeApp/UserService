/** messageProcessor.ts
 * Copyright (c) 2022, Toweclabs
 * All rights reserved.
 *
 * Class that handles all the valid types of message the service can receive
 */

// Libraries
import { AmqpMessage } from 'tow96-amqpwrapper';
import bcrypt from 'bcrypt-nodejs';
import logger from 'tow96-logger';

// Models
import { Objects, Requests } from './Models';

// Database
import DbUsers from './database/dbUsers';

// Utils
import Mailer from './utils/mailer';
import Validator from './utils/validator';

export default class MessageProcessor {
  static process = async (message: AmqpMessage): Promise<AmqpMessage> => {
    // Destructures the message
    const { type, payload } = message;

    // Switches the message type to run the appropriate function
    switch (type) {
      case 'change-email':
        return await MessageProcessor.changeEmail(payload);
      case 'change-Password':
        return await MessageProcessor.changePassword(payload);
      case 'change-Password-Force':
        return await MessageProcessor.changePasswordReset(payload);
      case 'edit-User':
        return await MessageProcessor.editUser(payload);
      case 'get-byUsername':
        return await MessageProcessor.getUserByUsername(payload);
      case 'get-byId':
        return await MessageProcessor.getUserById(payload);
      case 'get-users':
        return await MessageProcessor.getAllUsers();
      case 'log':
        return await MessageProcessor.logUser(payload);
      case 'password-reset':
        return await MessageProcessor.resetPassword(payload);
      case 'register':
        return await MessageProcessor.register(payload);
      case 'resend-emailVerify':
        return await MessageProcessor.resendEmailVerification(payload);
      case 'verify-email':
        return await MessageProcessor.verifyEmail(payload);
      default:
        logger.debug(`Unsupported function type: ${type}`);
        return AmqpMessage.errorMessage(`Unsupported function type: ${type}`);
    }
  };

  // Message processing functions ---------------------------------------------------------------

  /** changeEmail
   * Changes the email of a user, sends the verification email and sets the verification flag as false
   * @param {WorkerChangeEmail} message
   *
   * @returns An empty response
   */
  private static changeEmail = async (message: Requests.WorkerChangeEmail): Promise<AmqpMessage<null>> => {
    logger.http(`Change email for user: ${message._id}`);

    try {
      const dbUser = await DbUsers.getById(message._id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      // Validates the new email
      const { valid, errors } = await Validator.validateEmail(message.email);
      if (!valid) return AmqpMessage.errorMessage(`Invalid email`, 422, errors);

      // If valid, inserts the email
      await DbUsers.updateEmail(message._id, message.email.trim());

      // Sends the verification email
      Mailer.accountVerification(dbUser.name, message.email, message.token);

      return new AmqpMessage(null, 'change-email', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** changePassword
   * Changes the password of the user providing both the old password and a new one
   * @param {WorkerChangePassword} message
   *
   * @returns an empty message
   */
  private static changePassword = async (message: Requests.WorkerChangePassword): Promise<AmqpMessage<null>> => {
    logger.http(`Change password for user: ${message._id}`);

    try {
      const dbUser = await DbUsers.getById(message._id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      // Validates that the provided old password is correct
      const validOldPassword = await bcrypt.compareSync(message.oldPassword, dbUser.password || '');
      if (!validOldPassword) return AmqpMessage.errorMessage(`Invalid password`, 422, { password: `Invalid password` });

      // Confirms that the new password and the confirmPassword are the same
      if (message.newPassword.trim() === '')
        return AmqpMessage.errorMessage(`Password can't be blank`, 422, {
          confirmPassword: `Password can't be blank`,
        });

      const validNewPassword = message.newPassword === message.confirmPassword;
      if (!validNewPassword)
        return AmqpMessage.errorMessage(`Passwords are not the same`, 422, {
          confirmPassword: `Passwords are not the same`,
        });

      // Hashes and changes the new password
      const hashedPassword = bcrypt.hashSync(message.newPassword, '');
      const nuUser = await DbUsers.changePassword(message._id, hashedPassword);

      Mailer.passwordChange(nuUser);

      return new AmqpMessage(null, 'change-Password', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** changePasswordReset
   * changes the password without checking the old password (a verification from the API is REQUIRED)
   * @param {WorkerChangePassword} message
   *
   * @returns An empty response
   */
  private static changePasswordReset = async (message: Requests.WorkerChangePassword): Promise<AmqpMessage<null>> => {
    logger.http(`Change password for user: ${message._id}`);

    try {
      const dbUser = await DbUsers.getById(message._id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      // Confirms that the new password and the confirmPassword are the same
      if (message.newPassword.trim() === '')
        return AmqpMessage.errorMessage(`Password can't be blank`, 422, {
          confirmPassword: `Password can't be blank`,
        });

      const validNewPassword = message.newPassword === message.confirmPassword;
      if (!validNewPassword)
        return AmqpMessage.errorMessage(`Passwords are not the same`, 422, {
          confirmPassword: `Passwords are not the same`,
        });

      // Hashes and changes the new password
      const hashedPassword = bcrypt.hashSync(message.newPassword, '');
      const nuUser = await DbUsers.changePassword(message._id, hashedPassword);

      Mailer.passwordChange(nuUser);

      // Removes the resetToken
      await DbUsers.setResetToken(message._id, undefined);

      return new AmqpMessage(null, 'change-Password-Force', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** editUser
   * Edits the user information
   * @param {Objects.User.FrontendUser} message
   *
   * @returns The edited user
   */
  private static editUser = async (
    message: Objects.User.FrontendUser,
  ): Promise<AmqpMessage<Objects.User.BackendUser>> => {
    logger.http(`Edit user: ${message._id}`);

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
      if (Object.keys(content).length < 1) return new AmqpMessage({} as Objects.User.BackendUser, 'edit-User', 304);

      // Updates the transaction
      const updatedUser = await DbUsers.updateUser(message._id, content);

      return new AmqpMessage(updatedUser, 'edit-User', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** getAllUsers
   * Gets all users from the DB
   *
   * @returns An array of the users
   */
  private static getAllUsers = async (): Promise<AmqpMessage<Objects.User.BackendUser[]>> => {
    logger.http(`get all users`);

    try {
      const users = await DbUsers.getAll();

      return new AmqpMessage(users, 'get-all', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** getUserByUsername
   * Gets a user by it's username (email address)
   * @param {workerGetUserByUsername} message
   *
   * @returns the user
   */
  private static getUserByUsername = async (
    message: Requests.WorkerGetUserByUsername,
  ): Promise<AmqpMessage<Objects.User.BackendUser>> => {
    logger.http(`Get by email: ${message.username}`);

    try {
      const user = await DbUsers.getByEmail(message.username);

      return new AmqpMessage(user, 'get-byUsername', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** getUserById
   * Gets a user by it's Mongo ObjectId
   * @param {WorkerGetUserById} message
   *
   * @returns the user
   */
  private static getUserById = async (
    message: Requests.WorkerGetUserById,
  ): Promise<AmqpMessage<Objects.User.BackendUser>> => {
    logger.http(`Get by id: ${message._id}`);

    try {
      const user = await DbUsers.getById(message._id);

      return new AmqpMessage(user, 'get-byId', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** logUser
   * Updates the tokens of the user, this function is used for both log-in and log-out
   * @param {Objects.User.FrontendUser} message
   *
   * @returns The updated user
   */
  private static logUser = async (
    message: Objects.User.FrontendUser,
  ): Promise<AmqpMessage<Objects.User.BackendUser>> => {
    logger.http(`Log user: ${message._id}`);

    try {
      const user = await DbUsers.updateTokens(message);
      return new AmqpMessage(user, 'log', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** register
   * Adds a new user to the DB, also verifies that all fields are correct
   * @param {WorkerRegisterUser} message
   *
   * @returns the new user
   */
  private static register = async (
    message: Requests.WorkerRegisterUser,
  ): Promise<AmqpMessage<Objects.User.BackendUser>> => {
    logger.http(`Registering user under email: ${message.email}`);

    try {
      let errors = {};

      // Validates the email
      const emailValidation = await Validator.validateEmail(message.email);
      if (!emailValidation.valid) errors = { ...errors, ...emailValidation.errors };

      // Validates the name
      const nameValidation = await Validator.validateName(message.name);
      if (!nameValidation.valid) errors = { ...errors, ...nameValidation.errors };

      if (Object.keys(errors).length > 0) return AmqpMessage.errorMessage('Invalid Fields', 422, errors);

      // Sets the role
      if (message.role.toUpperCase() !== 'ADMIN') message.role = 'user';

      // Creates a temporary 8 character password
      const password = Math.random().toString(36).substring(2, 10);
      logger.debug(password);

      // Hashes the password
      const hashedPassword = bcrypt.hashSync(password, '');

      const newUser = await DbUsers.add(message.name.trim(), message.email.trim(), hashedPassword, message.role);

      // sends the password via email
      Mailer.registrationEmail(newUser.username, newUser.name, password);

      return new AmqpMessage(newUser, 'register', 200);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** resendEmailVerification
   * Sends a new verification email
   * @param {WorkerChangeEmail} message
   *
   * @returns An empty response
   */
  private static resendEmailVerification = async (message: Requests.WorkerChangeEmail): Promise<AmqpMessage<null>> => {
    try {
      const dbUser = await DbUsers.getById(message._id);

      // Confirms that the user still exists
      if (!dbUser) return AmqpMessage.errorMessage(`User deleted`, 400);

      Mailer.accountVerification(dbUser.name, dbUser.username, message.token);

      return new AmqpMessage(null, 'resend-emailVerify', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** resetPassword
   * Sets the resetPassword token for a user, is used for setting a new one and for removing it, this ensures that only one password token is valid at a time
   * @param {WorkerPasswordReset} message
   *
   * @returns An empty response
   */
  private static resetPassword = async (message: Requests.WorkerPasswordReset): Promise<AmqpMessage<null>> => {
    logger.http(`Reset password for user: ${message._id}`);

    try {
      // Stores the reset token
      const user = await DbUsers.setResetToken(message._id, message.token);

      // If a token was sent instead of being deleted, Sends the email
      if (message.token) Mailer.resetPasswordEmail(user, message.token);

      return new AmqpMessage(null, 'reset-password', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };

  /** verifyEmail
   * Updates the accountConfirmed field of a user
   * @param {WorkerChangeEmail} message
   *
   * @returns An empty response
   */
  private static verifyEmail = async (message: Requests.WorkerChangeEmail): Promise<AmqpMessage<null>> => {
    logger.http(`Updating verification for user: ${message._id}`);

    try {
      logger.debug(`updating verification for user: ${message._id}`);

      const db_user = await DbUsers.getById(message._id);

      // Only updates if not already confirmed
      if (!db_user.accountConfirmed) await DbUsers.updateAccountConfirmed(message._id);

      return new AmqpMessage(null, 'verify-client', 204);
    } catch (e) {
      return AmqpMessage.errorMessage(`Unexpected error`, 500, e);
    }
  };
}
