import { ObjectId } from 'mongodb';
import { TokenType, UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import {
  RegisterRequestBody,
  UpdateInfoRequestBody
} from '~/models/requests/User.requests';
import { Follower } from '~/models/schemas/Follower.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { User } from '~/models/schemas/User.schema';
import { hashPassword } from '~/utils/crypto';
import { signToken } from '~/utils/jwt';
import { generateProjection } from '~/utils/utils';
import databaseService from './database.services';

class UsersService {
  private signAccessToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      payload: {
        user_id,
        verify,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  private signRefreshToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  private signVerifyEmailToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      payload: { user_id, token_type: TokenType.VerifyEmailToken },
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    });
  }

  private signAccessAndRefreshToken(params: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return Promise.all([
      this.signAccessToken(params),
      this.signRefreshToken(params)
    ]);
  }

  private signForgotPasswordToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      payload: { user_id, token_type: TokenType.VerifyEmailToken },
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    });
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId();

    const email_verify_token = await this.signVerifyEmailToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    });

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    });

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

  checkUser({ email, password }: { email: string; password?: string }) {
    if (password) {
      return databaseService.users.findOne({
        email,
        password: hashPassword(password)
      });
    }
    return databaseService.users.findOne({
      email
    });
  }

  async login({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    });

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

  getInfo(user_id: string) {
    return databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: generateProjection<User>([
          'password',
          'email_verify_token',
          'forgot_password_token'
        ])
      }
    );
  }

  async verifyEmail(user_id: string) {
    const [[access_token, refresh_token]] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ])
    ]);

    return { access_token, refresh_token };
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signVerifyEmailToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    });
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    );
    return { message: 'Send verify email success' };
  }

  async forgotPassword({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    });
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { forgot_password_token }, $currentDate: { updated_at: true } }
    );
    // Gửi email kèm đường link đến email cho người dùng
    // Path: /reset-password?token=token
    console.log(forgot_password_token);
    return { message: 'Check your email to reset password' };
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { password: hashPassword(password), forgot_password_token: '' },
        $currentDate: { updated_at: true }
      }
    );
    return { message: 'Reset password success' };
  }

  async updateInfo(user_id: string, payload: UpdateInfoRequestBody) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: { ...payload },
        $currentDate: { updated_at: true }
      },
      {
        projection: generateProjection<User>([
          'password',
          'email_verify_token',
          'forgot_password_token'
        ]),
        returnDocument: 'after'
      }
    );
    return user.value;
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: generateProjection<User>([
          'password',
          'email_verify_token',
          'forgot_password_token',
          'verify',
          'created_at',
          'updated_at'
        ])
      }
    );

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'User not found'
      });
    }
  }

  async follow(user_id: string, followed_user_id: string) {
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });

    if (!isFollowed) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      );
      return { message: 'Follow success' };
    }

    return { message: 'Followed' };
  }

  async unfollow(user_id: string, unfollowed_user_id: string) {
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(unfollowed_user_id)
    });

    if (!isFollowed) {
      return { message: 'Already unfollowed' };
    }

    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(unfollowed_user_id)
    });
    return { message: 'Unfollowed success' };
  }

  async changePassword(
    user_id: string,
    old_password: string,
    new_password: string
  ) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    });

    if (!user) {
      return { message: 'Current password is not correct' };
    }

    await databaseService.users.updateOne(
      {
        user_id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(new_password),
            updated_at: '$$NOW'
          }
        }
      ]
    );
    return { message: 'Change password success' };
  }
}

const usersService = new UsersService();

export default usersService;
