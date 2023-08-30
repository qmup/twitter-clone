import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import tweetsService from '~/services/tweets.services';

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetsService.createTweet(body, user_id);
  return res.json({ message: 'Create success', result });
};
