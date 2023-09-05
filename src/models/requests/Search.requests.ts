import { Pagination } from './Tweet.requests';

export interface SearchQuery extends Pagination {
  content: string;
}
