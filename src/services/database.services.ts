import dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';
import { Follower } from '~/models/schemas/Follower.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { User } from '~/models/schemas/User.schema';

dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.f0ippoz.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
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
    return this.db.collection(process.env.DB_USERS_COLLECTION as string);
  }

  async indexUsers() {
    const isExistedIndex = this.users.indexExists([
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
    return this.db.collection(
      process.env.DB_REFRESH_TOKENS_COLLECTION as string
    );
  }

  async indexRefreshTokens() {
    const isExistedIndex = this.refreshTokens.indexExists(['exp_1', 'token_1']);
    if (!isExistedIndex) {
      this.refreshTokens.createIndex({ token: 1 });
      // background task trong mongodb, run every minute to check -> automatically remove expired deocument
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    }
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string);
  }

  async indexFollowers() {
    const isExistedIndex = this.followers.indexExists([
      'user_id_1_follower_id_1'
    ]);
    if (!isExistedIndex) {
      this.followers.createIndex({ user_id: 1, follower_id: 1 });
    }
  }
}

const databaseService = new DatabaseService();

export default databaseService;
