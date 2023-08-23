import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  TokenPayload,
  VerifyEmailRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/requests/User.requests';
import { User } from '~/models/schemas/User.schema';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
) => {
  const { user } = req;
  const { _id: user_id } = user as { _id: ObjectId };
  const result = await usersService.login(user_id.toString());
  return res.json({ message: 'Login successfully', result });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await usersService.register(req.body);
  return res.json({ message: 'Register successfully', result });
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
  if (!user.email_verify_token) {
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
  const { _id } = req.user as User;
  const result = await usersService.forgotPassword(
    (_id as ObjectId).toString()
  );
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
