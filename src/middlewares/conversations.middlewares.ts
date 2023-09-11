import { checkSchema } from 'express-validator';
import { validate } from '~/utils/validation';
import { userIdSchema } from './users.middlewares';

const getConversationsByReceiverIdSchema = checkSchema(
  {
    receiver_id: userIdSchema
  },
  ['params']
);

export const getConversationsByReceiverIdValidator = validate(
  getConversationsByReceiverIdSchema
);
