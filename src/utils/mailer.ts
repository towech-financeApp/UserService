/** mailer.js
 * Copyright (c) 2022, Towechlabs
 * All rights reserved.
 *
 * Utility that contains functions to generate and send emails
 */
import dotenv from 'dotenv';
dotenv.config();

import nodeMailer from 'nodemailer';
import mailgen from 'mailgen';
import logger from 'tow96-logger';
import { Objects } from '../Models';

const { EMAIL, EMAIL_PASSWORD, EMAIL_MAIN_URL, EMAIL_PROVIDER, FRONTEND } = process.env;

export default class Mailer {
  // Creates the email transporter
  private static transporter = nodeMailer.createTransport({
    service: EMAIL_PROVIDER,
    secure: true,
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  // creates an instance of the mail generator, that has all the common elements
  private static mailGenerator = new mailgen({
    theme: 'default',
    product: {
      name: 'Towech-FinanceApp',
      link: EMAIL_MAIN_URL || 'pepe',
      //TODO: Create and add logo
      //logo: 'https://avatars3.githubusercontent.com/u/11511711?s=460&u=9f55fbd68f05113f749132b9ca966e34b6337cf0&v=4'
    },
  });

  // function that sends the emails
  private static sendEmail = async (recipient: string, subject: string, content: mailgen.Content): Promise<void> => {
    const emailBody = Mailer.mailGenerator.generate(content);
    const emailText = Mailer.mailGenerator.generatePlaintext(content);

    const info = await Mailer.transporter.sendMail({
      from: `Towech-FinanceApp <${EMAIL}>`,
      to: recipient,
      subject: subject,
      text: emailText,
      html: emailBody,
    });

    logger.info(`Sent email ${info.messageId}`);
  };

  static registrationEmail = async (recipient: string, user: string, password: string) => {
    const content: mailgen.Content = {
      body: {
        greeting: `Hi`,
        name: user,
        intro: `Welcome to the Towech-FinanceApp`,
        action: {
          instructions: `Your access password is: ${password}`,
          button: {
            color: `#22BC66`,
            text: `Go to app`,
            link: `${FRONTEND}/home`,
          },
        },
        outro: `You'll be prompted to change your password when first loging in`,
        signature: `Thanks`,
      },
    };

    Mailer.sendEmail(recipient, 'Towech-FinanceApp registration', content);
  };

  static passwordChange = (user: Objects.User.BaseUser) => {
    const content: mailgen.Content = {
      body: {
        greeting: `Hi`,
        name: user.name,
        intro: `Your password has been succesfully changed`,
        signature: `Thanks`,
      },
    };

    Mailer.sendEmail(user.username, 'Towech-FinanceApp password change', content);
  };

  static resetPasswordEmail = async (user: Objects.User.BaseUser, token: string) => {
    const content: mailgen.Content = {
      body: {
        greeting: `Hi`,
        name: user.name,
        intro: `You've asked for a password reset.`,
        action: {
          instructions: `To restore your password, click on the following link. It'll only work for 24 hours`,
          button: {
            color: `#22BC66`,
            text: `Reset my password`,
            link: `${process.env.FRONTEND}/reset/${token}`,
          },
        },
        outro: `If you didn't request for this, ignore this email. Never send this link to anyone.`,
        signature: `From`,
      },
    };

    Mailer.sendEmail(user.username, `Towech-FinanceApp password reset`, content);
  };

  static accountVerification = async (name: string, recipient: string, token: string) => {
    const content: mailgen.Content = {
      body: {
        greeting: `Hi`,
        name: name,
        intro: `Verify this email account.`,
        action: {
          instructions: `To restore your password, click on the following link. It'll only work for 24 hours`,
          button: {
            color: `#22BC66`,
            text: `Reset my password`,
            link: `${process.env.FRONTEND}/verify/${token}`,
          },
        },
        signature: `From`,
      },
    };

    Mailer.sendEmail(recipient, `Towech-FinanceApp email verification`, content);
  };
}
