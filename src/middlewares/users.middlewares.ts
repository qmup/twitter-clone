import { Request } from 'express';
import { checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
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
            throw new Error('User not found');
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
      custom: {
        options: async (value, { req }) => {
          const access_token = value.split(' ')[1];

          if (!access_token) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: 'Access token is required'
            });
          }

          try {
            const decoded_authorization = await verifyToken({
              token: access_token
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
      notEmpty: true,
      custom: {
        options: async (value: string, { req }) => {
          try {
            const [decoded_refresh_token, refresh_token] = await Promise.all([
              verifyToken({ token: value }),
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

export const loginValidator = validate(loginSchema);
export const registerValidator = validate(registerSchema);
export const accessTokenValidator = validate(accessTokenSchema);
export const refreshTokenValidator = validate(refreshTokenSchema);
