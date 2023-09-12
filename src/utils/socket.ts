import { Server as HttpServer } from 'http';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';
import { UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import Conversation from '~/models/schemas/Conversations.schema';
import databaseService from '~/services/database.services';
import { verifyAccessToken } from '~/utils/commons';

const initSocket = (httpServer: HttpServer) => {
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
      socket.handshake.auth.access_token = access_token;
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

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth;
      try {
        await verifyAccessToken(access_token);
        next();
      } catch (error) {
        next(new Error('Unauthorized'));
      }
    });

    socket.on('error', (err) => {
      if (err.message === 'Unauthorized') {
        socket.disconnect();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(reason);
    });

    socket.on('send_message', async (arg) => {
      const { from_user_id, to_user_id, content } = arg;
      const receiver_socket_id = users[to_user_id]?.socket_id;

      const conversation = new Conversation({
        content,
        from_user_id: new ObjectId(from_user_id),
        to_user_id: new ObjectId(to_user_id)
      });

      const result = await databaseService.conversations.insertOne(
        conversation
      );
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
};

export default initSocket;
