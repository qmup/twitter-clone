import { ParamsDictionary } from 'express-serve-static-core';

export interface BookmarkRequestBody {
  tweet_id: string;
}

export interface UnbookmarkRequestParams extends ParamsDictionary {
  tweet_id: string;
}
