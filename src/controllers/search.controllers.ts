import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { SearchQuery } from '~/models/requests/Search.requests';
import searchService from '~/services/search.services';

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const { content, limit, page } = req.query;

  const data = await searchService.search({
    content,
    limit,
    page,
    user_id: req.decoded_authorization?.user_id
  });

  const result = {
    data,
    content,
    limit: Number(limit),
    page: Number(page)
  };

  res.json({ message: 'Search success', result });
};
