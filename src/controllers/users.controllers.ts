import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';
import {
  EmailVerifyRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  TokenPayload
} from '~/models/requests/User.requests';
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
  return res.json({ message: 'Logout succesfully' });
};

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody>,
  res: Response
) => {
  const { decoded_email_verify_token } = req;
  const { user_id } = decoded_email_verify_token as TokenPayload;
  const user = await usersService.checkVerifyEmail(user_id);
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
  return res.json({ message: 'Verify succesfully', result });
};
