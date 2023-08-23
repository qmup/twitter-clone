import { Request } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';

// checkSchema sẽ mặc định check cả tất cả
// 'body' | 'cookies' | 'headers' | 'params' | 'query'
// nếu chỉ muốn check body thì chỉ thêm body như là dependency
// để nhanh hơn, cải thiện performance

const passwordSchema: Record<string, ParamSchema> = {
  password: {
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 6
      }
    }
  },
  confirm_password: {
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 6
      }
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }
    }
  }
};

const forgotPasswordTokenSchema: Record<string, ParamSchema> = {
  forgot_password_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: 'Token is required'
          });
        }

        try {
          const decoded_verify_forgot_password_token = await verifyToken({
            token: value,
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
          });

          const { user_id } = decoded_verify_forgot_password_token;
          const user = await databaseService.users.findOne({
            _id: new ObjectId(user_id)
          });

          if (!user) {
            throw new Error('User not found');
          }

          if (value !== user.forgot_password_token) {
            throw new Error('Invalid token');
          }

          req.decoded_verify_forgot_password_token =
            decoded_verify_forgot_password_token;

          return true;
        } catch (error) {
          throw new ErrorWithStatus({
            message: 'Invalid token',
            status: HTTP_STATUS.UNAUTHORIZED
          });
        }
      }
    }
  }
};

const loginSchema = checkSchema(
  {
    email: {
      trim: true,
      isEmail: true,
      custom: {
        options: async (value, { req }) => {
          const user = await usersService.checkUser({
            email: value,
            password: req.body.password
          });
          if (!user) {
            throw new Error('Wrong email or password!');
          }
          req.user = user;
          return true;
        }
      }
    },
    password: {
      notEmpty: true,
      isStrongPassword: {
        options: {
          minLength: 6
        }
      }
    }
  },
  ['body']
);

const registerSchema = checkSchema(
  {
    ...passwordSchema,
    name: {
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      }
    },
    email: {
      notEmpty: true,
      trim: true,
      isEmail: true,
      custom: {
        options: async (value) => {
          const user = await usersService.checkEmailExist(value);
          if (user) {
            throw new ErrorWithStatus({
              message: 'Email already exists',
              status: HTTP_STATUS.UNAUTHORIZED
            });
          }
          return true;
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  },
  ['body']
);

const accessTokenSchema = checkSchema(
  {
    Authorization: {
      notEmpty: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const access_token = (value || '').split(' ')[1];

          if (!access_token) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: 'Token is required'
            });
          }

          try {
            const decoded_authorization = await verifyToken({
              token: access_token,
              privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
            });
            (req as Request).decoded_authorization = decoded_authorization;
          } catch (error) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: (error as JsonWebTokenError).message
            });
          }

          return true;
        }
      }
    }
  },
  ['headers']
);

const refreshTokenSchema = checkSchema(
  {
    refresh_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: 'Token is required'
            });
          }
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({
                token: value,
                privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              }),
              databaseService.refreshTokens.findOne({ token: value })
            ]);
            if (!refresh_token) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: 'Refresh token not found'
              });
            }
            (req as Request).decoded_refresh_token = decoded_refresh_token;
            return true;
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: 'Refresh token is invalid',
                status: HTTP_STATUS.UNAUTHORIZED
              });
            }
            throw error;
          }
        }
      }
    }
  },
  ['body']
);

const verifyEmailTokenSchema = checkSchema(
  {
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: 'Token is required'
            });
          }

          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            });

            (req as Request).decoded_email_verify_token =
              decoded_email_verify_token;
            return true;
          } catch (error) {
            throw new ErrorWithStatus({
              message: 'Invalid token',
              status: HTTP_STATUS.UNAUTHORIZED
            });
          }
        }
      }
    }
  },
  ['body']
);

const forgotPasswordSchema = checkSchema(
  {
    email: {
      isEmail: true,
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          const user = await usersService.checkUser({ email: value });
          if (!user) {
            throw new Error('User not found');
          }
          req.user = user;
          return true;
        }
      }
    }
  },
  ['body']
);

const verifyForgotPasswordSchema = checkSchema(forgotPasswordTokenSchema, [
  'body'
]);

const resetPasswordSchema = checkSchema(
  {
    ...passwordSchema,
    ...forgotPasswordTokenSchema
  },
  ['body']
);

export const loginValidator = validate(loginSchema);
export const registerValidator = validate(registerSchema);
export const accessTokenValidator = validate(accessTokenSchema);
export const refreshTokenValidator = validate(refreshTokenSchema);
export const verifyEmailTokenValidator = validate(verifyEmailTokenSchema);
export const forgotPasswordValidator = validate(forgotPasswordSchema);
export const verifyForgotPasswordValidator = validate(
  verifyForgotPasswordSchema
);
export const resetPasswordValidator = validate(resetPasswordSchema);
