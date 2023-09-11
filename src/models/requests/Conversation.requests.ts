import { ParamsDictionary, Query } from 'express-serve-static-core';
import { Pagination } from './Tweet.requests';

export interface GetConversationsByReceiverIdParams extends ParamsDictionary {
  receiver_id: string;
}

export type GetConversationsByReceiverIdQuery = Query & Pagination;
