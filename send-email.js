/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses');
const { config } = require('dotenv');

config();
// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_1
  }
});

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
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

const sendVerifyEmail = async ({ toAddress, subject, body }) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_ADDRESS_1,
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

sendVerifyEmail({
  toAddress: process.env.SES_ADDRESS_2,
  subject: 'Title test',
  body: '<h1>Content</h1>'
});
