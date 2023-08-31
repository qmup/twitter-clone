import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  LikeRequestBody,
  UnlikeRequestParams
} from '~/models/requests/Like.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import likesService from '~/services/likes.services';

export const likeController = async (
  req: Request<ParamsDictionary, any, LikeRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likesService.like(user_id, tweet_id);
  return res.json({ message: 'Like success', result });
};

export const unlikeController = async (
  req: Request<UnlikeRequestParams>,
  res: Response
) => {
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likesService.unlike(user_id, tweet_id);
  return res.json({ message: 'Unlike success', result });
};
