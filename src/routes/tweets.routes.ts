import { Router } from 'express';
import {
  createTweetController,
  getNewsFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers';
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  isUserLoggedInValidator,
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
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetController)
);

/**
 * Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetChildrenValidator),
  wrapRequestHandler(getTweetChildrenController)
);

/**
 * Get newsfeeds
 * Path: /
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewsFeedsController)
);

export default tweetsRouter;
