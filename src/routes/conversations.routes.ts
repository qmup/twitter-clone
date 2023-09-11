import { Router } from 'express';
import { getConversationsByReceiverIdController } from '~/controllers/conversations.controllers';
import { getConversationsByReceiverIdValidator } from '~/middlewares/conversations.middlewares';
import { paginationValidator } from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const conversationsRouter = Router();

conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsByReceiverIdValidator,
  wrapRequestHandler(getConversationsByReceiverIdController)
);

export default conversationsRouter;
