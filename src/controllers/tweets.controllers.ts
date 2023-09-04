import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  GetTweetRequestParams,
  TweetRequestBody
} from '~/models/requests/Tweet.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import tweetsService from '~/services/tweets.services';

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetsService.createTweet(body, user_id);
  return res.json({ message: 'Create tweet success', result });
};

export const getTweetController = async (
  req: Request<GetTweetRequestParams>,
  res: Response
) => {
  // normally do query here
  // however, already findOne in tweetIdValidator
  // -> do in tweetIdValidator
  const { guest_views, user_views } = await tweetsService.increaseView(
    req.params.tweet_id,
    req.decoded_authorization?.user_id
  );

  const result = { ...req.tweet, guest_views, user_views };

  return res.json({ message: 'Get tweet success', result });
};
