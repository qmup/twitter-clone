import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { RegisterRequestBody } from '~/models/requests/User.requests';
import usersService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  res.json({ message: 'Login successfully ' });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  try {
    const result = await usersService.register(req.body);
    return res.json({ message: 'Reigster successfully', result });
  } catch (error) {
    return res.status(400).json({ message: 'Register failed', error });
  }
};
