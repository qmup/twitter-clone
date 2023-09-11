import { ObjectId } from 'mongodb';
import databaseService from './database.services';

class ConversationsService {
  async getConversationsByReceiverId({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string;
    receiver_id: string;
    limit: number;
    page: number;
  }) {
    const result = await databaseService.conversations
      .find({
        $or: [
          {
            from_user_id: new ObjectId(sender_id),
            to_user_id: new ObjectId(receiver_id)
          },
          {
            from_user_id: new ObjectId(receiver_id),
            to_user_id: new ObjectId(sender_id)
          }
        ]
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray();

    const total = await databaseService.conversations.countDocuments({
      $or: [
        {
          from_user_id: new ObjectId(sender_id),
          to_user_id: new ObjectId(receiver_id)
        },
        {
          from_user_id: new ObjectId(receiver_id),
          to_user_id: new ObjectId(sender_id)
        }
      ]
    });
    return { result, total };
  }
}

const conversationsService = new ConversationsService();

export default conversationsService;
