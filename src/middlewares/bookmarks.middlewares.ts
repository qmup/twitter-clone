import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import { BookmarkRequestBody } from '~/models/requests/Bookmark.requests';
import { RequestBodySchema } from '~/utils/commons';
import { validate } from '~/utils/validation';

const bookmarkSchema = checkSchema(
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
  } as RequestBodySchema<BookmarkRequestBody>,
  ['body']
);

const unbookmarkSchema = checkSchema(
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

export const bookmarkValidator = validate(bookmarkSchema);
export const unbookmarkValidator = validate(unbookmarkSchema);
