import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import '~/utils/fake';
import { ObjectId } from 'mongodb';
import { UPLOAD_VIDEO_DIR } from './constants/dir';
import { UserVerifyStatus } from './constants/enums';
import HTTP_STATUS from './constants/httpStatus';
import { defaultErrorHandler } from './middlewares/error.middlewares';
import { ErrorWithStatus } from './models/Errors';
import { TokenPayload } from './models/requests/User.requests';
import Conversation from './models/schemas/Conversations.schema';
import bookmarksRouter from './routes/bookmarks.routes';
import conversationsRouter from './routes/conversations.routes';
import likesRouter from './routes/likes.routes';
import mediasRouter from './routes/medias.routes';
import searchRouter from './routes/search.routes';
import staticRouter from './routes/static.routes';
import tweetsRouter from './routes/tweets.routes';
import usersRouter from './routes/users.routes';
import databaseService from './services/database.services';
import { verifyAccessToken } from './utils/commons';
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

io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth;
  const access_token = Authorization?.split(' ')[1];
  try {
    const decoded_authorization = await verifyAccessToken(access_token);
    const { verify } = decoded_authorization as TokenPayload;
    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: 'User not verified',
        status: HTTP_STATUS.FORBIDDEN
      });
    }
    socket.handshake.auth.decoded_authorization = decoded_authorization;
    next();
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    });
  }
});

io.on('connection', (socket) => {
  console.log(`${socket.id} conntected`);
  const { user_id } = socket.handshake.auth
    .decoded_authorization as TokenPayload;
  users[user_id] = { socket_id: socket.id };

  socket.on('send_message', async (arg) => {
    const { from_user_id, to_user_id, content } = arg;
    const receiver_socket_id = users[to_user_id]?.socket_id;

    const conversation = new Conversation({
      content,
      from_user_id: new ObjectId(from_user_id),
      to_user_id: new ObjectId(to_user_id)
    });

    const result = await databaseService.conversations.insertOne(conversation);
    conversation._id = result.insertedId;

    if (receiver_socket_id) {
      socket.to(receiver_socket_id).emit('receive_message', conversation);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    delete users[user_id];
    console.log(`${socket.id} disconnected`);
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
app.use('/conversations', conversationsRouter);

app.use(defaultErrorHandler);

httpServer.listen(port);
