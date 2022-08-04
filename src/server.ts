/** index.ts
 * Copyright (c) 2022, Towechlabs
 *
 * File that initiates the service
 */

// Imports the environment variables
import dotenv from 'dotenv';
dotenv.config();

// Libraries
import express from 'express';
import logger from 'tow96-logger';
import mongoose from 'mongoose';
import Queue, { AmqpMessage } from 'tow96-amqpwrapper';

// Main class
import UserService from '.';

// Gets some values from the env, if not present, uses default values
const queueName = process.env.QUEUE_NAME || 'userQueue';
const databaseUrl = process.env.DATABASE_URL || '';
const httpPort = process.env.PORT || 3000;
const serviceName = process.env.NAME || 'UserService';

// Connect to database function
const connectToMongo = (): void => {
  mongoose
    .connect(databaseUrl)
    .then(() => logger.info('Connected to database'))
    .catch((err) => {
      if (databaseUrl !== '') {
        logger.error(`${err}`);
        logger.info('Process exited with code 1');
      } else {
        logger.error('No Mongo url provided, exiting with error 1');
      }
      process.exit(1);
    });
};

// Worker Main function
const runWorker = async (): Promise<void> => {
  connectToMongo();

  // Connects to rabbitMQ and sets a channel up
  const connection = await Queue.startConnection();
  const channel = await Queue.setUpChannelAndExchange(connection);

  // Asserts and binds the queue that all workers of this type will user
  const userQ = await channel.assertQueue(queueName, { durable: false });
  channel.bindQueue(userQ.queue, Queue.exchangeName, queueName);

  const userService = new UserService();

  // Begins to listen for messages on the queue
  logger.info(`Listening for messages on queue ${queueName}`);

  // Using the channel cosume, the program enters a loop that will check continously
  channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return; // If there is no message, finishes and checks again, this allows for faster iterations

      // Handles the message
      try {
        const { type, payload } = JSON.parse(msg.content.toString());
        let response = AmqpMessage.errorMessage(`Unexpected error`, 500);

        switch (type) {
          case 'change-email':
            response = await userService.changeEmail(payload);
            break;
          case 'change-Password':
            response = await userService.changePassword(payload);
            break;
          case 'change-Password-Force':
            response = await userService.changePasswordReset(payload);
            break;
          case 'delete-User':
            response = await userService.deleteUser(payload);
            break;
          case 'edit-User':
            response = await userService.editUser(payload);
            break;
          case 'get-byUsername':
            response = await userService.getByUsername(payload);
            break;
          case 'get-byId':
            response = await userService.getUserById(payload);
            break;
          case 'get-users':
            response = await userService.getAllUsers();
            break;
          case 'log':
            response = await userService.logUser(payload);
            break;
          case 'password-reset':
            response = await userService.resetPassword(payload);
            break;
          case 'register':
            response = await userService.register(payload);
            break;
          case 'resend-emailVerify':
            response = await userService.resendEmailVerification(payload);
            break;
          case 'verify-email':
            response = await userService.verifyEmail(payload);
            break;
          default:
            logger.debug(`Unsupported function type: ${type}`);
            response = AmqpMessage.errorMessage(`Unsupported function type: ${type}`);
        }

        // reply if necessary
        if (msg.properties.replyTo)
          Queue.respondToQueue(channel, msg.properties.replyTo, msg.properties.correlationId, response);

        // Acknowledges the message
        channel.ack(msg);
      } catch (err: any) {
        logger.error(err);
      }
    },
    { noAck: false },
  );
};

// Start Server: Starts a simple HTTP server to report that the worker is alive
const startServer = async (): Promise<void> => {
  const app = express();
  app.set('port', httpPort);

  app.get('/', (_, res) => {
    res.send(`${serviceName} is running`);
  });

  // Starts the server
  app.listen(app.get('port'), () => {
    logger.info(`Server running on port: ${app.get('port')}`);
  });
};

// Starts the service
runWorker().catch((err) => {
  logger.error(err);
});

startServer().catch((err: any) => {
  logger.error(err);
  logger.error('Exiting app with code 1');
  process.exit(1);
});
