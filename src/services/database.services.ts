import { Collection, Db, MongoClient } from 'mongodb';
import { envConfig } from '~/constants/config';
import Bookmark from '~/models/schemas/Bookmark.schema';
import Conversation from '~/models/schemas/Conversations.schema';
import { Follower } from '~/models/schemas/Follower.schema';
import Hashtag from '~/models/schemas/Hashtag.schema';
import Keo from '~/models/schemas/Keo.schema';
import Like from '~/models/schemas/Like.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import { User } from '~/models/schemas/User.schema';

const uri = `mongodb+srv://${envConfig.DB_USERNAME}:${envConfig.DB_PASSWORD}@twitter.f0ippoz.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(envConfig.DB_NAME);
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log('Connected 🎉');
    } catch (error) {
      console.log('Error', error);
      throw Error;
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.DB_USERS_COLLECTION as string);
  }

  async indexUsers() {
    const isExistedIndex = await this.users.indexExists([
      'email_1',
      'email_1_password_1',
      'user_id_1_follower_id_1',
      'username_1'
    ]);
    if (!isExistedIndex) {
      this.users.createIndex({ email: 1, password: 1 });
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
    }
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.DB_REFRESH_TOKENS_COLLECTION as string);
  }

  async indexRefreshTokens() {
    const isExistedIndex = await this.refreshTokens.indexExists([
      'exp_1',
      'token_1'
    ]);
    if (!isExistedIndex) {
      this.refreshTokens.createIndex({ token: 1 });
      // background task trong mongodb, run every minute to check -> automatically remove expired deocument
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    }
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.DB_FOLLOWERS_COLLECTION as string);
  }

  async indexFollowers() {
    const isExistedIndex = await this.followers.indexExists([
      'user_id_1_follower_id_1'
    ]);
    if (!isExistedIndex) {
      this.followers.createIndex({ user_id: 1, follower_id: 1 });
    }
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.DB_TWEETS_COLLECTION as string);
  }

  async indexTweets() {
    const isExistedIndex = await this.tweets.indexExists(['content_text']);
    if (!isExistedIndex) {
      this.tweets.createIndex(
        { content: 'text' },
        { default_language: 'none' }
      );
    }
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.DB_HASHTAGS_COLLECTION as string);
  }

  async indexHashtags() {
    const isExistedIndex = await this.hashtags.indexExists(['name_text']);
    if (!isExistedIndex) {
      this.hashtags.createIndex({ name: 'text' });
    }
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.DB_BOOKMARKS_COLLECTION as string);
  }

  get likes(): Collection<Like> {
    return this.db.collection(envConfig.DB_LIKES_COLLECTION as string);
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.DB_CONVERSATIONS_COLLECTION as string);
  }

  get keo(): Collection<Keo> {
    return this.db.collection(envConfig.DB_KEOS_COLLECTION as string);
  }
}

const databaseService = new DatabaseService();

export default databaseService;
