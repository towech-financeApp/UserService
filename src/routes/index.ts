/** index.js
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Index that holds all the "routes" of the worker
 */
import { AmqpMessage } from 'tow96-amqpwrapper';

import logger from 'tow96-logger';

// routes
import { getByUsername, getById } from './get-user';
import login from './login';
import register from './register';

/** processMessage
 * switch functions that calls the approppriate process for the worker
 *
 * @params {AmqpMessage} message containing the request
 *
 * @returns {Promise<AmqpMessage>} Message containing the response
 */
const processMessage = async (message: AmqpMessage): Promise<AmqpMessage> => {
  // Destructures the message
  const { type, payload } = message;

  // Switches the message to execute the appropriate function
  switch (type) {
    case 'get-byUsername':
      return await getByUsername(payload);
    case 'get-byId':
      return await getById(payload);
    case 'login':
      return await login(payload);
    case 'register':
      return await register(payload);
    default:
      logger.debug(`Unsupported function type: ${type}`);
      return AmqpMessage.errorMessage(`Unsupported function type: ${type}`);
  }
};

export default processMessage;
