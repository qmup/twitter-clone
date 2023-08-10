import express from 'express';
import usersRouter from './routes/users.routes';
import DatabaseService from './services/database.services';

const port = 4000;
const app = express();

app.use(express.json());
app.use('/users', usersRouter);

DatabaseService.connect();

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
