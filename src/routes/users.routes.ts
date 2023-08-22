import { Router } from 'express';
import {
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController
} from '~/controllers/users.controllers';
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const usersRouter = Router();

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string; email: string; password: string; date_of_birth: ISO8601 }
 */
usersRouter.post(
  '/register',
  registerValidator,
  wrapRequestHandler(registerController)
);

/**
 * Logout
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
);

/**
 * Verify email when user clicks on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post(
  '/verify-email',
  verifyEmailTokenValidator,
  wrapRequestHandler(verifyEmailController)
);

/**
 * Verify email when user clicks on the link in email
 * Path: /resend-verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
);

export default usersRouter;
