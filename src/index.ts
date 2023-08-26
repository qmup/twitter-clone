import express from 'express';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import mediasRouter from './routes/medias.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolder } from './utils/file';

const port = 4000;
const app = express();
databaseService.connect();

// create folder uploads
initFolder();

app.use(express.json());
app.use('/users', usersRouter);
app.use('/medias', mediasRouter);

app.use(defaultErrorHandler);

app.listen(port);
