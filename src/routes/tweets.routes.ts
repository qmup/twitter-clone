import { Router } from 'express';
import {
  createTweetController,
  getTweetController
} from '~/controllers/tweets.controllers';
import {
  createTweetValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const tweetsRouter = Router();

/**
 * Create tweet
 * Path: /
 * Method: POST
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
);

/**
 * Get tweet
 * Path: /
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  wrapRequestHandler(getTweetController)
);

export default tweetsRouter;
