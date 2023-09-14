import { checkSchema } from 'express-validator';
import { validate } from '~/utils/validation';

export const postKeoValidator = validate(
  checkSchema(
    {
      home: {
        isString: true
      },
      away: {
        isString: true
      },
      time: {
        isISO8601: true
      },
      prediction: {
        isString: true
      },
      win_rate: {
        isNumeric: true
      },
      description: {
        isString: true
      }
    },
    ['body']
  )
);
