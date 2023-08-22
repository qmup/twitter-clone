import { ObjectId } from 'mongodb';
import { TokenType } from '~/constants/enums';
import { RegisterRequestBody } from '~/models/requests/User.requests';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { User } from '~/models/schemas/User.schema';
import { hashPassword } from '~/utils/crypto';
import { signToken } from '~/utils/jwt';
import databaseService from './database.services';

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      payload: { user_id, token_type: TokenType.AccessToken },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  private signVerifyEmailToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      payload: { user_id, token_type: TokenType.VerifyEmailToken },
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    });
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ]);
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId();

    const email_verify_token = await this.signVerifyEmailToken(
      user_id.toString()
    );

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id.toString()
    );

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    );

    return {
      access_token,
      refresh_token
    };
  }

  checkEmailExist(email: string) {
    return databaseService.users.findOne({ email });
  }

  checkUser({ email, password }: { email: string; password: string }) {
    return databaseService.users.findOne({
      email,
      password: hashPassword(password)
    });
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id
    );

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    );

    return {
      access_token,
      refresh_token
    };
  }

  logout(token: string) {
    return databaseService.refreshTokens.deleteOne({ token });
  }

  checkVerifyEmail(user_id: string) {
    return databaseService.users.findOne({ _id: new ObjectId(user_id) });
  }

  async verifyEmail(user_id: string) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ])
    ]);

    return { access_token, refresh_token };
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signVerifyEmailToken(user_id);
    console.log(
      '🚀 ~ file: users.services.ts:131 ~ UsersService ~ resendVerifyEmail ~ email_verify_token:',
      email_verify_token
    );
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    );
    return { message: 'Send verify email success' };
  }
}

const usersService = new UsersService();

export default usersService;
