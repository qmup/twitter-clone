import { checkSchema } from 'express-validator';
import { SearchQuery } from '~/models/requests/Search.requests';
import { MediaTypeQuery } from '~/models/requests/Tweet.requests';
import { RequestSchema } from '~/utils/commons';
import { validate } from '~/utils/validation';

const searchSchema = checkSchema(
  {
    content: {
      isString: true,
      errorMessage: 'Content must be string'
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)],
        errorMessage: 'Invalid media_type'
      }
    },
    people_follow: {
      optional: true,
      isBoolean: true,
      errorMessage: 'People_follow must be boolean'
    }
  } as RequestSchema<SearchQuery> as any,
  ['query']
);

export const searchValidator = validate(searchSchema);
