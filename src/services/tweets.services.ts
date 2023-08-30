import { ObjectId } from 'mongodb';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';
import Tweet from '~/models/schemas/Tweet.schema';
import databaseService from './database.services';

class TweetsService {
  async createTweet(body: TweetRequestBody, user_id: string) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [], // TODO: Not implemented yet
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    );
    return databaseService.tweets.findOne({
      _id: new ObjectId(result.insertedId)
    });
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
