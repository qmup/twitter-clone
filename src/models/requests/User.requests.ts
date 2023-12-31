import { ParamsDictionary } from 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';
import { UserVerifyStatus } from '~/constants/enums';

export interface TokenPayload extends JwtPayload {
  user_id: string;
  token_type: string;
  verify: UserVerifyStatus;
  exp: number;
  iat: number;
}
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LogoutRequestBody {
  refresh_token: string;
}

export interface VerifyEmailRequestBody {
  email_verify_token: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string;
}

export interface ResetPasswordRequestBody {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
}

export interface UpdateInfoRequestBody {
  name?: string;
  date_of_birth?: Date;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
}

export interface GetProfileRequestParam {
  username: string;
}

export interface FollowRequestBody {
  followed_user_id: string;
}

export interface UnfollowRequestParams extends ParamsDictionary {
  user_id: string;
}
export interface ChangePasswordRequestBody {
  old_password: string;
  password: string;
  confirm_password: string;
}

export type RefreshTokenRequestBody = {
  refresh_token: string;
};
