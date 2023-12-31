import { Router } from 'express';
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getInfoController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateInfoController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middlewares';
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateInfoValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordValidator
} from '~/middlewares/users.middlewares';
import { UpdateInfoRequestBody } from '~/models/requests/User.requests';
import { wrapRequestHandler } from '~/utils/handlers';

const usersRouter = Router();

// /**
//  * @openapi
//  * /users/login:
//  *  post:
//  *    tags:
//  *      - users
//  *    summary: Đăng nhập
//  *    description: Đăng nhập vào hệ thống
//  *    operationId: login
//  *    requestBody:
//  *      description: Thông tin đăng nhập
//  *      content:
//  *        application/json:
//  *          schema:
//  *            $ref: '#/components/schemas/LoginBody'
//  *      required: true
//  *    responses:
//  *      '200':
//  *        description: Đăng nhập thành công
//  *        content:
//  *          application/json:
//  *            schema:
//  *              type: object
//  *              properties:
//  *                message:
//  *                  type: string
//  *                  example: Login success
//  *                result:
//  *                  $ref: '#/components/schemas/SuccessAuthentication'
//  */
/**
 * Oauth Google
 * Path: /oauth/google
 * Method: GET
 */

usersRouter.get('/oauth/google', wrapRequestHandler(oauthController));

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

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

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
 * Path: /:username
 * Method: GET
 * Params: { username: string }
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
);

/**
 * unfollow someone
 * Path: /follow/:user_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { user_id: string }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
);

/**
 * Change password
 * Path: /change-password
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { old_password: string; password: string; confirm_password: string;}
 */
usersRouter.patch(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
);

/**
 * Refresh token
 * Path: /refresh-token
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/refresh-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
);

export default usersRouter;
