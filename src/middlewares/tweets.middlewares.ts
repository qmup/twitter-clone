import { NextFunction, Request, Response } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import {
  MediaType,
  TweetAudience,
  TweetType,
  UserVerifyStatus
} from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import Tweet from '~/models/schemas/Tweet.schema';
import databaseService from '~/services/database.services';
import tweetsService from '~/services/tweets.services';
import { RequestBodySchema, numberEnumToArray } from '~/utils/commons';
import { validate } from '~/utils/validation';

const imageSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 200
    }
  }
};

const tweetTypes = numberEnumToArray(TweetType);
const tweetAudiences = numberEnumToArray(TweetAudience);
const mediaTypes = numberEnumToArray(MediaType);

const createTweetSchema = checkSchema(
  {
    type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: 'Invalid type'
      }
    },
    audience: {
      isIn: {
        options: [tweetAudiences],
        errorMessage: 'Invalid audience'
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const { type } = req.body as TweetRequestBody;
          if (
            [
              TweetType.Retweet,
              TweetType.Comment,
              TweetType.QuoteTweet
            ].includes(type) &&
            !ObjectId.isValid(value)
          ) {
            throw new Error('Parent must be tweetId');
          }
          if (type === TweetType.Tweet && !!value) {
            throw new Error('Parent must be null');
          }
          return true;
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const { type, hashtags, mentions } = req.body as TweetRequestBody;
          if (
            [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(
              type
            ) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error('Content must be non-empty string');
          }
          if (type === TweetType.Retweet && value !== '') {
            throw new Error('Content must be empty string');
          }
          return true;
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value: Array<any>) => {
          if (!value.every((item) => typeof item === 'string')) {
            throw new Error('Hashtags must be an array of string');
          }
          return true;
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value: Array<any>) => {
          if (!value.every((item) => ObjectId.isValid(item))) {
            throw new Error('Mentions must be an array of user id');
          }
          return true;
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value: Array<any>) => {
          if (!value.every((item) => mediaTypes.includes(item))) {
            throw new Error('Meida must be an array of media object');
          }
          return true;
        }
      }
    }
  } as RequestBodySchema<TweetRequestBody>,
  ['body']
);

const tweetIdSchema = checkSchema(
  {
    tweet_id: {
      isMongoId: true,
      custom: {
        options: async (value, { req }) => {
          const tweet = await tweetsService.findTweetById(value);
          if (!tweet) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_GATEWAY,
              message: 'Tweet not found'
            });
          }
          req.tweet = tweet;
        }
      }
    }
  },
  ['body', 'params']
);
export const audienceValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tweet = req.tweet as Tweet;
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // if logged in, must have decoded_authorization
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'Access token is required'
      });
    }
    // check whether author's account is valid
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    });
    console.log('🚀 ~ file: tweets.middlewares.ts:169 ~ author:', author);
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'User not found'
      });
    }
    const { user_id } = req.decoded_authorization as TokenPayload;
    // check whether this user is included in twitter circle
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) =>
      user_circle_id.equals(user_id)
    );
    console.log('🚀 ~ file: tweets.middlewares.ts:180 ~ user_id:', user_id);
    console.log(
      '🚀 ~ file: tweets.middlewares.ts:181 ~ twitter_circle:',
      author.twitter_circle
    );
    console.log(
      '🚀 ~ file: tweets.middlewares.ts:181 ~ twitter_circle:',
      author._id,
      author._id.equals(user_id)
    );
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: 'Tweet is not public'
      });
    }
  }
  next();
};

export const createTweetValidator = validate(createTweetSchema);
export const tweetIdValidator = validate(tweetIdSchema);
