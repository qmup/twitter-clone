import { Request, Response } from 'express';
import {
  GetConversationsByReceiverIdParams,
  GetConversationsByReceiverIdQuery
} from '~/models/requests/Conversation.requests';
import { TokenPayload } from '~/models/requests/User.requests';
import conversationsService from '~/services/conversations.services';

export const getConversationsByReceiverIdController = async (
  req: Request<
    GetConversationsByReceiverIdParams,
    any,
    any,
    GetConversationsByReceiverIdQuery
  >,
  res: Response
) => {
  const { receiver_id } = req.params;
  const { limit: l, page: p } = req.query;
  const limit = Number(l);
  const page = Number(p);
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { result, total } =
    await conversationsService.getConversationsByReceiverId({
      sender_id: user_id,
      receiver_id,
      page,
      limit
    });
  return res.json({
    message: 'Get conversations success',
    result: {
      conversations: result,
      page,
      limit,
      total_page: Math.ceil(total / limit)
    }
  });
};
