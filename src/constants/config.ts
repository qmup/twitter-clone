import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV;
const envFileName = `.env.${env}`;
const isExistedEnvFile = fs.existsSync(path.resolve(envFileName));

if (!env) {
  console.log(`Not added environment yet! (NODE_ENV=$environment)`);
  process.exit(1);
}

if (!isExistedEnvFile) {
  console.log(`Environment file (${envFileName}) not found!`);
  process.exit(1);
}

console.log(`Using ${envFileName} for environment!`);

export const isProduction = env === 'production';

config({ path: envFileName });

export const envConfig = {
  HOST: process.env.HOST as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_KEOS_COLLECTION: process.env.DB_KEOS_COLLECTION as string,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION as string,
  DB_REFRESH_TOKENS_COLLECTION: process.env
    .DB_REFRESH_TOKENS_COLLECTION as string,
  DB_FOLLOWERS_COLLECTION: process.env.DB_FOLLOWERS_COLLECTION as string,
  DB_TWEETS_COLLECTION: process.env.DB_TWEETS_COLLECTION as string,
  DB_HASHTAGS_COLLECTION: process.env.DB_HASHTAGS_COLLECTION as string,
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTION as string,
  DB_LIKES_COLLECTION: process.env.DB_LIKES_COLLECTION as string,
  DB_CONVERSATIONS_COLLECTION: process.env
    .DB_CONVERSATIONS_COLLECTION as string,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET as string,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env
    .JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env
    .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env
    .EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env
    .FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  CLIENT_REDIRECT_URI: process.env.CLIENT_REDIRECT_URI as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_ACCESS_KEY_ID_1: process.env.AWS_ACCESS_KEY_ID_1 as string,
  AWS_SECRET_ACCESS_KEY_1: process.env.AWS_SECRET_ACCESS_KEY_1 as string,
  SES_ADDRESS_1: process.env.SES_ADDRESS_1 as string,
  AWS_ACCESS_KEY_ID_2: process.env.AWS_ACCESS_KEY_ID_2 as string,
  AWS_SECRET_ACCESS_KEY_2: process.env.AWS_SECRET_ACCESS_KEY_2 as string,
  SES_ADDRESS_2: process.env.SES_ADDRESS_2 as string,
  AWS_BUCKET: process.env.AWS_BUCKET as string
};
