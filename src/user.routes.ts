import { Router } from 'express';

const userRouter = Router();

userRouter.use((req, res, next) => {
  console.log('Time 1: ', Date.now());
  next();
});

userRouter.get('/tweet', (req, res) => {
  res.send('This is tweet!');
});

userRouter.get('/user', (req, res) => {
  res.send('This is user!');
});

export default userRouter;
