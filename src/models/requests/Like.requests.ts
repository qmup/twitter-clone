import { ParamsDictionary } from 'express-serve-static-core';

export interface LikeRequestBody {
  tweet_id: string;
}

export interface UnlikeRequestParams extends ParamsDictionary {
  tweet_id: string;
}
