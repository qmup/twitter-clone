import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import { LikeRequestBody } from '~/models/requests/Like.requests';
import { RequestBodySchema } from '~/utils/commons';
import { validate } from '~/utils/validation';

const likeSchema = checkSchema(
  {
    tweet_id: {
      isString: true,
      custom: {
        options: (value) => {
          if (!ObjectId.isValid(value)) {
            throw new Error('Invalid tweet_id');
          }
          return true;
        }
      }
    }
  } as RequestBodySchema<LikeRequestBody>,
  ['body']
);

const unlikeSchema = checkSchema(
  {
    tweet_id: {
      isString: true,
      custom: {
        options: (value) => {
          if (!ObjectId.isValid(value)) {
            throw new Error('Invalid tweet_id');
          }
          return true;
        }
      }
    }
  },
  ['params']
);

export const likeValidator = validate(likeSchema);
export const unlikeValidator = validate(unlikeSchema);
