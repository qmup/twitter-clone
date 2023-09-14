import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
// import '~/utils/fake';
import helmet from 'helmet';
import { envConfig, isProduction } from './constants/config';
import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import bookmarksRouter from './routes/bookmarks.routes';
import conversationsRouter from './routes/conversations.routes';
import keosRouter from './routes/keo.routes';
import likesRouter from './routes/likes.routes';
import mediasRouter from './routes/medias.routes';
import searchRouter from './routes/search.routes';
import staticRouter from './routes/static.routes';
import tweetsRouter from './routes/tweets.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolder } from './utils/file';
import { limiter } from './utils/limiter';
import initSocket from './utils/socket';
import { initSwagger } from './utils/swagger';

const port = 4000;
const app = express();
const httpServer = createServer(app);

// start socket server
initSocket(httpServer);

// init swagger
initSwagger(app);

const connectIndexDb = async () => {
  await databaseService.connect();
  databaseService.indexUsers();
  databaseService.indexRefreshTokens();
  databaseService.indexFollowers();
  databaseService.indexHashtags();
  databaseService.indexTweets();
};

connectIndexDb();

// create folder uploads
initFolder();

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: isProduction ? envConfig.CLIENT_URL : '*'
  })
);
app.use(limiter);

app.use('/keo-hom-nay', keosRouter);
app.use('/users', usersRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRouter);
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR));
app.use('/tweets', tweetsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/likes', likesRouter);
app.use('/search', searchRouter);
app.use('/conversations', conversationsRouter);
app.use(defaultErrorHandler);

httpServer.listen(port);
