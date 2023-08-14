import { User } from '~/models/User.schema';
import databaseService from './database.services';

class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const result = await databaseService.users.insertOne(new User({ email, password }));
    return result;
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return !!user;
  }
}

const usersService = new UsersService();

export default usersService;
