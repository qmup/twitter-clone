import { ObjectId } from 'mongodb';
import { MediaType, TweetAudience, TweetType } from '~/constants/enums';
import { SearchQuery } from '~/models/requests/Search.requests';
import { MediaTypeQuery } from '~/models/requests/Tweet.requests';
import databaseService from './database.services';

class SearchService {
  async search(query: SearchQuery & { user_id?: string }) {
    const { user_id, media_type, people_follow: pl } = query;
    const limit = Number(query.limit);
    const page = Number(query.page);
    const people_follow = !!pl;

    const $match: any = {
      $text: {
        $search: query.content
      }
    };

    if (media_type && media_type === MediaTypeQuery.Image) {
      $match['medias.type'] = MediaType.Image;
    }
    if (media_type && media_type === MediaTypeQuery.Video) {
      $match['medias.type'] = { $in: [MediaType.Video, MediaType.HLS] };
    }
    if (people_follow) {
      const following_users = await databaseService.followers
        .find({
          user_id: new ObjectId(user_id)
        })
        .toArray();
      $match['user_id'] = {
        $in: following_users.map((item) => item.followed_user_id)
      };
    }

    const [tweets, [total]] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'author.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.QuoteTweet]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              author: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          }
        ])
        .toArray(),

      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'author.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'tweet_count'
          }
        ])
        .toArray()
    ]);

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId);
    const date = new Date();

    databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        $set: { updated_at: date }
      }
    );

    tweets.forEach((tweet) => {
      tweet.updated_at = date;
      if (user_id) {
        tweet.user_views += 1;
      } else {
        tweet.guest_views += 1;
      }
    });
    return { tweets, total: total?.tweet_count ?? 0 };
  }
}

const searchService = new SearchService();

export default searchService;
