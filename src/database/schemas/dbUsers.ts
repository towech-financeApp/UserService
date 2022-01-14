/** dbUsers.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Schema that describes the User and functions that use it
 */
import mongoose from 'mongoose';
import { User } from '../../Models';

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  role: String,
  accountConfirmed: Boolean,
  refreshTokens: [String],
  singleSessionToken: String,
  resetToken: String,
  createdAt: String,
});

const userCollection = mongoose.model('Users', UserSchema);

// Functions to communicate with the DB
export default class DbUsers {
  /** add
   * Adds a user to the DB
   *
   * @param {string} name
   * @param {string} username
   * @param {string} password
   * @param {string} role
   *
   * @returns The inserted transaction
   */
  static add = async (name: string, username: string, password: string, role = 'user'): Promise<User> => {
    const newUser: unknown = await new userCollection({
      name,
      username,
      password,
      role,
      verified: true,
      createdAt: new Date().toISOString(),
    }).save();

    return newUser as User;
  };

  /** getByEmail
   * Gets the user with the given email
   *
   * @param {string} username
   *
   * @returns {User} The user from the DB
   */
  static getByEmail = async (username: string): Promise<User> => {
    const response = await userCollection.findOne({ username });
    return response as User;
  };

  /** getById
   * Gets the user with the given id
   *
   * @param {string} userid
   *
   * @returns {User} The user from the DB
   */
  static getById = async (id: string): Promise<User> => {
    const response = await userCollection.findById(id);
    return response as User;
  };

  /** updateTokens
   * Sets the refreshTokens of the user
   *
   * @param {User} user The user that will be updated
   *
   * @returns {User} The updated user
   */
  static updateTokens = async (user: User): Promise<User> => {
    const { refreshTokens, singleSessionToken } = user;
    const response = await userCollection.findByIdAndUpdate(user._id, { refreshTokens, singleSessionToken });

    return response as User;
  };

  /** updateUser
   * updates the user's information
   *
   * @param {string} id The id of the user
   * @param {User} contents The contents that will be updated
   *
   * @returns {User} The updated user
   */
  static updateUser = async (id: string, contents: User): Promise<User> => {
    const response: User = await userCollection.findByIdAndUpdate(id, { $set: { ...contents } }, { new: true });

    return response;
  };

  /** changePassword
   * updates the user's information
   *
   * @param {string} id The id of the user
   * @param {string} password The new password
   *
   */
  static changePassword = async (id: string, password: string): Promise<User> => {
    const response: User = await userCollection.findByIdAndUpdate(id, { password });

    return response;
  };

  /** setResetToken
   * assigns a resetToken to the user
   *
   * @param {string} id The id of the user
   * @param {string} token The token
   *
   */
  static setResetToken = async (id: string, token: string | undefined): Promise<User> => {
    const user = await userCollection.findByIdAndUpdate(id, { resetToken: token });

    // If there is no user, throws an error
    if (!user) throw { error: 'Inexistent user' };

    return user;
  };

  /** updateEmail
   * updates the users email
   *
   * @param {string} id The id of the user
   * @param {string} email The email
   *
   */
  static updateEmail = async (id: string, email: string): Promise<User> => {
    const user = await userCollection.findByIdAndUpdate(id, { username: email, accountConfirmed: false });

    // If there is no user, throws an error
    if (!user) throw { error: 'Inexistent user' };

    return user;
  };
}
