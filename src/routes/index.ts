/** index.ts
 * Copyright (c) 2021, Jose Tow
 * All rights reserved.
 *
 * Index that holds all the "routes" of the worker
 */
import { AmqpMessage } from 'tow96-amqpwrapper';

import logger from 'tow96-logger';

// routes
import GetUser from './get-user';
import log from './log';
import register from './register';
import editUser from './edit-user';
import changePassword from './change-Password';
import resetPassword from './password-reset';
import changeEmail from './change-Email';

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
      return await GetUser.byUsername(payload);
    case 'get-byId':
      return await GetUser.byId(payload);
    case 'log':
      return await log(payload);
    case 'register':
      return await register(payload);
    case 'edit-User':
      return await editUser(payload);
    case 'change-Password':
      return await changePassword.withOldPass(payload);
    case 'change-Password-Force':
      return await changePassword.withReset(payload);
    case 'password-reset':
      return await resetPassword.set(payload);
    case 'change-email':
      return await changeEmail.setNew(payload);
    case 'resend-emailVerify':
      return await changeEmail.resendEmail(payload);
    case 'verify-client':
      return await changeEmail.updateVerification(payload);
    default:
      logger.debug(`Unsupported function type: ${type}`);
      return AmqpMessage.errorMessage(`Unsupported function type: ${type}`);
  }
};

export default processMessage;
