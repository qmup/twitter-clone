import { ObjectId, WithId } from 'mongodb';
import Like from '~/models/schemas/Like.schema';
import databaseService from './database.services';

class LikesService {
  async like(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );
    return result.value as WithId<Like>;
  }

  unlike(user_id: string, tweet_id: string) {
    return databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });
  }
}

const likesService = new LikesService();

export default likesService;
