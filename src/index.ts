import express from 'express';
import userRouter from './user.routes';

const port = 4000;
const app = express();

app.use('/user', userRouter);
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
