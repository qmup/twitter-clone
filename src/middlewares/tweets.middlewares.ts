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
import { RequestSchema, numberEnumToArray } from '~/utils/commons';
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
  } as RequestSchema<TweetRequestBody>,
  ['body']
);

const getTweetChildrenSchema = checkSchema(
  {
    limit: {
      isNumeric: true,
      custom: {
        options: async (value) => {
          const num = Number(value);
          if (num < 1) {
            throw new Error('Minumum is 1');
          }
          if (num > 100 && num < 1) {
            throw new Error('Maximum is 100');
          }
          return true;
        }
      }
    },
    page: {
      isNumeric: true
    },
    tweet_type: {
      isIn: {
        options: [tweetTypes],
        errorMessage: 'Invalid type'
      }
    }
  },
  ['query']
);

const tweetIdSchema = checkSchema(
  {
    tweet_id: {
      isMongoId: true,
      custom: {
        options: async (value, { req }) => {
          const [tweet] = await databaseService.tweets
            .aggregate<Tweet>([
              {
                $match: {
                  _id: new ObjectId(value)
                }
              },
              {
                $lookup: {
                  from: 'hashtags',
                  localField: 'hashtags',
                  foreignField: '_id',
                  as: 'hashtags'
                }
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'mentions',
                  foreignField: '_id',
                  as: 'mentions'
                }
              },
              {
                $addFields: {
                  mentions: {
                    $map: {
                      input: '$mentions',
                      as: 'mention',
                      in: {
                        _id: '$$mention._id',
                        name: '$$mention.name',
                        username: '$$mention.username',
                        email: '$$mention.email'
                      }
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: 'bookmarks',
                  localField: '_id',
                  foreignField: 'tweet_id',
                  as: 'bookmarks'
                }
              },
              {
                $lookup: {
                  from: 'likes',
                  localField: '_id',
                  foreignField: 'tweet_id',
                  as: 'likes'
                }
              },
              {
                $lookup: {
                  from: 'tweets',
                  localField: '_id',
                  foreignField: 'parent_id',
                  as: 'tweet_children'
                }
              },
              {
                $addFields: {
                  bookmarks: {
                    $size: '$bookmarks'
                  },
                  likes: {
                    $size: '$likes'
                  },
                  retweet_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.Retweet]
                        }
                      }
                    }
                  },
                  comment_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.Comment]
                        }
                      }
                    }
                  },
                  quote_count: {
                    $size: {
                      $filter: {
                        input: '$tweet_children',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.type', TweetType.QuoteTweet]
                        }
                      }
                    }
                  }
                }
              },
              {
                $project: {
                  tweet_children: 0
                }
              }
            ])
            .toArray();
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
export const getTweetChildrenValidator = validate(getTweetChildrenSchema);
