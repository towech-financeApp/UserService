/** transactions.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Functions to communicate with the DB
 */

import { User } from '../../Models';
import Query from '../pg';

export default class DbUsers {
  // Functions to communicate with the DB
  /** add
   * Adds a user to the DB
   * 
   * @param name
   * @param username
   * @param password
   * @param role
   * 
   * @returns The inserted transaction
   */
  static add = async (name: string, username: string, password: string, role: string = 'user'): Promise<User> => {
    const response = await Query(`INSERT INTO Users(name, username, password, role) VALUES('${name}', '${username}', '${password}', '${role}') RETURNING *`);
    return response.rows[0] as User;
  }

  /** getByEmail
   * Gets the user with the given email
   *
   * @param {string} username
   *
   * @returns {User} The user from the DB
   */
  static getByEmail = async (username: string): Promise<User> => {
    const response = await Query(`SELECT * FROM Users WHERE username = '${username}'`);
    return response.rows[0] as User;
  };

  /** getById
   * Gets the user with the given id
   *
   * @param {string} userid
   *
   * @returns {User} The user from the DB
   */
  static getById = async (userid: string): Promise<User> => {
    const response = await Query(`SELECT * FROM Users WHERE userID = '${userid}'`);
    return response.rows[0] as User;
  };

  /** login
   * Gets the user with the given email
   *
   * @param {User} user The user that will be updated
   *
   * @returns {User} The corrected user
   */
  static login = async (user: User): Promise<User> => {
    const response = await Query(`UPDATE Users SET refreshTokens = '{${user.refreshtokens}}', singleSessionToken = '${user.singlesessiontoken}' WHERE userID = ${user.userid} RETURNING *`);

    return response.rows[0] as User;
  };
}
