import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { SearchQuery } from '~/models/requests/Search.requests';
import searchService from '~/services/search.services';

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const { content, limit, page, media_type, people_follow } = req.query;

  const { total, tweets } = await searchService.search({
    content,
    limit,
    page,
    user_id: req.decoded_authorization?.user_id,
    media_type,
    people_follow
  });

  return res.json({
    message: 'Search success',
    result: {
      tweets,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(total / Number(limit))
    }
  });
};
