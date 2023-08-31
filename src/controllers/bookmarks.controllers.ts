import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  BookmarkRequestBody,
  UnbookmarkRequestParams
} from '~/models/requests/Bookmark.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import bookmarksService from '~/services/bookmarks.services';

export const bookmarkController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarksService.bookmark(user_id, tweet_id);
  return res.json({ message: 'Bookmark success', result });
};

export const unbookmarkController = async (
  req: Request<UnbookmarkRequestParams>,
  res: Response
) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await bookmarksService.unbookmark(user_id, tweet_id);
  return res.json({ message: 'Unbookmark success', result });
};
