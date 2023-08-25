import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import {
  ChangePasswordRequestBody,
  FollowRequestBody,
  ForgotPasswordRequestBody,
  GetProfileRequestParam,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  UnfollowRequestParams,
  UpdateInfoRequestBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/requests/User.requests';
import { User } from '~/models/schemas/User.schema';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query;
  const { access_token, newUser, refresh_token } = await usersService.oauth(
    code as string
  );
  const urlRedirect = `${process.env.CLIENT_REDIRECT_URI}?access_token=${access_token}&refresh_token=${refresh_token}&newUser=${newUser}`;
  return res.redirect(urlRedirect);
};

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
) => {
  const { user } = req;
  const { _id, verify } = user as User;
  const result = await usersService.login({
    user_id: (_id as ObjectId).toString(),
    verify
  });
  return res.json({ message: 'Login success', result });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await usersService.register(req.body);
  return res.json({ message: 'Register success', result });
};

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body;
  await usersService.logout(refresh_token);
  return res.json({ message: 'Logout success' });
};

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { decoded_email_verify_token } = req;
  const { user_id } = decoded_email_verify_token as TokenPayload;
  const user = await usersService.getInfo(user_id);
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: 'User not found' });
  }

  // Đã verify rồi thì không báo lỗi -> trả về status OK với messsage đã verify rồi
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: 'Email already verified' });
  }

  const result = await usersService.verifyEmail(user_id);
  return res.json({ message: 'Verify success', result });
};

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  });
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: 'User not found' });
  }

  // Đã verify rồi thì không báo lỗi -> trả về status OK với messsage đã verify rồi
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: 'Email already verified' });
  }

  const result = await usersService.resendVerifyEmail(user_id);
  return res.json(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User;
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify
  });
  return res.json(result);
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response
) => {
  return res.json({ message: 'Verify forgot password success' });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_verify_forgot_password_token as TokenPayload;
  const { password } = req.body;
  const result = await usersService.resetPassword(user_id, password);
  return res.json(result);
};

export const getInfoController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.getInfo(user_id);
  return res.json({ message: 'Get info success', result });
};

export const updateInfoController = async (
  req: Request<ParamsDictionary, any, UpdateInfoRequestBody>,
  res: Response
) => {
  const { body } = req;
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await usersService.updateInfo(user_id, body);
  return res.json({ message: 'Update info success', result });
};

export const getProfileController = async (
  req: Request<GetProfileRequestParam>,
  res: Response
) => {
  const { username } = req.params;
  const result = await usersService.getProfile(username);
  return res.json({ message: 'Get profile success', result });
};

export const followController = async (
  req: Request<ParamsDictionary, any, FollowRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { followed_user_id } = req.body;
  const result = await usersService.follow(user_id, followed_user_id);
  return res.json(result);
};

export const unfollowController = async (
  req: Request<UnfollowRequestParams>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { user_id: unfollowed_user_id } = req.params;
  const result = await usersService.unfollow(user_id, unfollowed_user_id);
  return res.json(result);
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { old_password, password } = req.body;
  const result = await usersService.changePassword(
    user_id,
    old_password,
    password
  );
  return res.json(result);
};
