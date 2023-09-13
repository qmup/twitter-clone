import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import fs from 'fs';
import { envConfig } from '~/constants/config';
import { VERIFY_EMAIL_FILE } from '~/constants/dir';

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.AWS_REGION as string,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY_1 as string,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID_1 as string
  }
});

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string;
  toAddresses: string | string[];
  ccAddresses?: string | string[];
  body: string;
  subject: string;
  replyToAddresses?: string | string[];
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses:
      replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  });
};

export const sendVerifyEmail = async ({
  toAddress,
  subject,
  body
}: {
  toAddress: string;
  subject: string;
  body: string;
}) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.SES_ADDRESS_1 as string,
    toAddresses: toAddress,
    body,
    subject
  });

  try {
    await sesClient.send(sendEmailCommand);
    console.log('Done');
    return;
  } catch (e) {
    console.error('Failed to send email.');
    return e;
  }
};

const verifyEmailTemplate = fs.readFileSync(VERIFY_EMAIL_FILE, 'utf8');

export const sendVerifyRegisterEmail = ({
  toAddress,
  email_verify_token,
  template = verifyEmailTemplate
}: {
  toAddress: string;
  email_verify_token: string;
  template?: string;
}) => {
  return sendVerifyEmail({
    toAddress,
    subject: 'Verify your email',
    body: template
      .replace('{{title}}', 'Please verify your email')
      .replace('{{content}}', 'Click the button below to verify your email')
      .replace('{{titleLink}}', 'Verify your email')
      .replace(
        '{{link}}',
        `${envConfig.CLIENT_URL}/verify-email?token=${email_verify_token}`
      )
  });
};

export const sendForgotPasswordEmail = ({
  toAddress,
  forgot_password_token,
  template = verifyEmailTemplate
}: {
  toAddress: string;
  forgot_password_token: string;
  template?: string;
}) => {
  return sendVerifyEmail({
    toAddress,
    subject: 'Forgot password',
    body: template
      .replace(
        '{{title}}',
        'You are receiving this email because you requested to reset password'
      )
      .replace('{{content}}', 'Click the button below to reset password')
      .replace('{{titleLink}}', 'Reset password')
      .replace(
        '{{link}}',
        `${envConfig.CLIENT_URL}/reset-password?token=${forgot_password_token}`
      )
  });
};
