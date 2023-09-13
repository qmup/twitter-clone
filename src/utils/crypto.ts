import { createHash } from 'crypto';
import { envConfig } from '~/constants/config';

export const sha256 = (content: string) =>
  createHash('sha256').update(content).digest('hex');

export const hashPassword = (password: string) =>
  sha256(password + envConfig.PASSWORD_SECRET);
