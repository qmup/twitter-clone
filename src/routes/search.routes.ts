import { Router } from 'express';
import { searchController } from '~/controllers/search.controllers';
import { searchValidator } from '~/middlewares/search.middlewares';
import { paginationValidator } from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const searchRouter = Router();

searchRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  wrapRequestHandler(searchController)
);

export default searchRouter;
