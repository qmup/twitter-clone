import { Request } from 'express';

class TweetsService {
  async createTweet(req: Request) {
    // await databaseService.tweets.insertOne(new Tweet())
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
