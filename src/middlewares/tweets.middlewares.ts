import { ParamSchema, checkSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import { MediaType, TweetAudience, TweetType } from '~/constants/enums';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';
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

export const createTweetValidator = validate(createTweetSchema);
