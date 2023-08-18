import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import {
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody
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
