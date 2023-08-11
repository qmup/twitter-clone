import { Request, Response } from 'express';
import usersService from '~/services/users.services';

export const loginController = (req: Request, res: Response) => {
  res.json({ message: 'Login successfully ' });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await usersService.register({ email, password });
    return res.json({ message: 'Reigster successfully', result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Register failed', error });
  }
};
