import { ObjectId, WithId } from 'mongodb';
import Bookmark from '~/models/schemas/Bookmark.schema';
import databaseService from './database.services';

class BookmarksService {
  async bookmark(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );
    return result.value as WithId<Bookmark>;
  }

  unbookmark(user_id: string, tweet_id: string) {
    return databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });
  }
}

const bookmarksService = new BookmarksService();

export default bookmarksService;
