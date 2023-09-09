import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import '~/utils/fake';
import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import bookmarksRouter from './routes/bookmarks.routes';
import likesRouter from './routes/likes.routes';
import mediasRouter from './routes/medias.routes';
import searchRouter from './routes/search.routes';
import staticRouter from './routes/static.routes';
import tweetsRouter from './routes/tweets.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { initFolder } from './utils/file';

const port = 4000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000' // Replace with your React client's URL
  }
});

const users: {
  [key: string]: { socket_id: string };
} = {};
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  const { user_id } = socket.handshake.auth;
  users[user_id] = { socket_id: socket.id };

  socket.on('private message', (arg) => {
    console.log('users:', users);
    console.log('arg:', arg);
    const receiver_socket_id = users[arg.to].socket_id;
    socket
      .to(receiver_socket_id)
      .emit('receive private message', { content: arg.content, from: user_id });
  });

  // Disconnect
  socket.on('disconnect', () => {
    delete users[user_id];
    console.log(`User ${socket.id} disconnected`);
  });
});

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
app.use(cors());

app.use('/users', usersRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRouter);
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR));
app.use('/tweets', tweetsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/likes', likesRouter);
app.use('/search', searchRouter);

app.use(defaultErrorHandler);

httpServer.listen(port);
