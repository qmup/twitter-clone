import { Router } from 'express';
import { loginController, registerController } from '~/controllers/users.controllers';
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares';

const usersRouter = Router();

usersRouter.post('/login', loginValidator, loginController);

/**
 * Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string; email: string; password: string; date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, registerController);

export default usersRouter;
