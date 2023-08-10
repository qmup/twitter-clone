import { Router } from 'express';
import { loginController } from '~/controllers/users.controllers';
import { loginValidator } from '~/middlewares/users.middlewares';

const usersRouter = Router();

usersRouter.use((req, res, next) => {
  console.log('Time 1: ', Date.now());
  next();
});

usersRouter.get('/tweet', (req, res) => {
  res.send('This is tweet!');
});

usersRouter.post('/login', loginValidator, loginController);

export default usersRouter;
