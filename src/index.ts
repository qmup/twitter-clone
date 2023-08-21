import express from 'express';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import usersRouter from './routes/users.routes';
import DatabaseService from './services/database.services';

const port = 4000;
const app = express();
DatabaseService.connect();

app.use(express.json());
app.use('/users', usersRouter);

app.use(defaultErrorHandler);

app.listen(port);
