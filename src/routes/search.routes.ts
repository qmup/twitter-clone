import { Router } from 'express';
import { searchController } from '~/controllers/search.controllers';
import { paginationValidator } from '~/middlewares/tweets.middlewares';
import {
  accessTokenValidator,
  isUserLoggedInValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const searchRouter = Router();

searchRouter.get(
  '/',
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  wrapRequestHandler(searchController)
);

export default searchRouter;
