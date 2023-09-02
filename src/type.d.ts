import 'express';
import { TokenPayload } from './models/requests/User.requests';
import Tweet from './models/schemas/Tweet.schema';
import { User } from './models/schemas/User.schema';

declare module 'express' {
  interface Request {
    user?: User;
    decoded_authorization?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_email_verify_token?: TokenPayload;
    decoded_verify_forgot_password_token?: TokenPayload;
    tweet?: Tweet;
  }
}
