import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TweetType } from '~/constants/enums';
import {
  GetTweetChildrenRequestQuery,
  GetTweetRequestParams,
  Pagination,
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
  const { guest_views, user_views, updated_at } =
    await tweetsService.increaseView(
      req.params.tweet_id,
      req.decoded_authorization?.user_id
    );

  const result = { ...req.tweet, guest_views, user_views, updated_at };

  return res.json({ message: 'Get tweet success', result });
};

export const getTweetChildrenController = async (
  req: Request<GetTweetRequestParams, any, any, GetTweetChildrenRequestQuery>,
  res: Response
) => {
  const { limit, page, tweet_type } = req.query;
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id,
    tweet_type: Number(tweet_type) as TweetType,
    limit: Number(limit),
    page: Number(page),
    user_id
  });

  return res.json({
    message: 'Get tweet children success',
    result: {
      tweets,
      tweet_type,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(total / Number(limit))
    }
  });
};

export const getNewsFeedsController = async (
  req: Request<any, any, any, Pagination>,
  res: Response
) => {
  const { limit, page } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const { total, tweets } = await tweetsService.getNewsFeeds({
    limit: Number(limit),
    page: Number(page),
    user_id
  });

  return res.json({
    message: 'Get newsfeeds success',
    result: {
      tweets,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(total / Number(limit))
    }
  });
};
