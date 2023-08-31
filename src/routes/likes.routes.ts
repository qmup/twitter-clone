import { Router } from 'express';
import {
  likeController,
  unlikeController
} from '~/controllers/likes.controllers';
import { tweetIdValidator } from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const likesRouter = Router();

/**
 * Like tweet
 * Path: /
 * Method: POST
 * Body: LikeRequestBody
 */
likesRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeController)
);

/**
 * Unlike tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Body: LikeRequestBody
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeController)
);

export default likesRouter;
