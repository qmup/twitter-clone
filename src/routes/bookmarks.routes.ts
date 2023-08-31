import { Router } from 'express';
import {
  bookmarkController,
  unbookmarkController
} from '~/controllers/bookmarks.controllers';
import { tweetIdValidator } from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const bookmarksRouter = Router();

/**
 * Bookmark tweet
 * Path: /
 * Method: POST
 * Body: BookmarkRequestBody
 */
bookmarksRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController)
);

/**
 * Unbookmark tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkController)
);

export default bookmarksRouter;
