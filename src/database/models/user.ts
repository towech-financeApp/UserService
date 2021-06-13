/** transactions.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Class that contains all the functions to communicate to the users table
 */

import Query from '../pg';

export default class User {
  userID: number;
  name: string;
  username: string;
  password: string | undefined;
  role: string;
  accountConfirmed: boolean;
  refreshTokens: string[];
  singleSessionToken: string;
  createdAt: Date;

  /** constructor
   * Intended for creating from JSON, not to create the values as a straight function
   */
  private constructor(
    userID: number,
    name: string,
    username: string,
    password: string,
    role: string,
    accountConfirmed: boolean,
    refreshTokens: string[],
    singleSessionToken: string,
    createdAt: Date,
  ) {
    this.userID = userID;
    this.name = name;
    this.username = username;
    this.password = password;
    this.role = role;
    this.accountConfirmed = accountConfirmed;
    this.refreshTokens = refreshTokens;
    this.singleSessionToken = singleSessionToken;
    this.createdAt = createdAt;
  }

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
    return response.rows[0];
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
}
