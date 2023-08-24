import { Router } from 'express';
import {
  forgotPasswordController,
  getInfoController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateInfoController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middlewares';
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateInfoValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares';
import { UpdateInfoRequestBody } from '~/models/requests/User.requests';
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

/**
 * Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
);

/**
 * verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
);

/**
 * reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string; new_password: string; confirm_new_password: string }
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
);

/**
 * get user info
 * Path: /info
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get(
  '/info',
  accessTokenValidator,
  wrapRequestHandler(getInfoController)
);

/**
 * update user info
 * Path: /update-info
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * Body: { user: User }
 */
usersRouter.patch(
  '/info',
  accessTokenValidator,
  verifiedUserValidator,
  updateInfoValidator,
  filterMiddleware<UpdateInfoRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateInfoController)
);

/**
 * get user info
 * Path: /update-info
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * Body: { user: User }
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController));

export default usersRouter;
