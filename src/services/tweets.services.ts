import { ObjectId, WithId } from 'mongodb';
import { TweetRequestBody } from '~/models/requests/Tweet.requests';
import Hashtag from '~/models/schemas/Hashtag.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import databaseService from './database.services';

class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((name) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name },
          { $setOnInsert: new Hashtag({ name }) },
          { upsert: true, returnDocument: 'after' }
        );
      })
    );
    return hashtagDocuments.map(
      (hashtag) => (hashtag.value as WithId<Hashtag>)._id
    );
  }

  async createTweet(body: TweetRequestBody, user_id: string) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags);
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
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

  findTweetById(tweet_id: string) {
    return databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) });
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    );
    return result.value as WithId<{ guest_views: number; user_views: number }>;
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
