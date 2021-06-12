/** index.ts
 *
 * Main file for the worker of the user service
 *
 */
// Imports the environment variables
import dotenv from 'dotenv';
dotenv.config();

// Libraries
import Queue from 'tow96-amqpwrapper';
import logger from 'tow96-logger';

// Gets some values from the env, if not present, uses default values
const queueName = process.env.QUEUE_NAME || 'userQueue';

// It's declared as function so it can be asynchronous
const runWorker = async () => {
  // Connects to rabbitMQ and sets a channel up
  const connection = await Queue.startConnection();
  const channel = await Queue.setUpChannelAndExchange(connection);

  // Asserts and binds the queue that all workers of this type will user
  const userQ = await channel.assertQueue(queueName, { durable: false });
  channel.bindQueue(userQ.queue, Queue.exchangeName, queueName);

  // Begins to listen for messages on the queue
  logger.info(`Listening for messages on queue ${queueName}`);

  channel.consume(
    queueName,
    (msg) => {
      if (!msg) {
        return;
      }

      try {
        logger.debug(msg.content.toString());

        logger.debug(msg.properties.replyTo);
        if (msg.properties.replyTo) {
          channel.sendToQueue(msg.properties.replyTo, msg.content, {
            correlationId: msg.properties.correlationId,
          });
        }
      } catch (err: any) {
        logger.error(err);
      }

      channel.ack(msg);
    },
    { noAck: false },
  );
};

runWorker().catch((err) => {
  logger.error(err);
});
