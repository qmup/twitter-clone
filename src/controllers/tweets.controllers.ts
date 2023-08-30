import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  // const tweet = req.body;
  // const result = await tweetsService.createTweet(tweet);
  return res.json({ message: 'Create success' });
};
