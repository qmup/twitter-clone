import { NextFunction, Request, Response } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { envConfig } from '~/constants/config';
import { UserVerifyStatus } from '~/constants/enums';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';
import { verifyAccessToken } from '~/utils/commons';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';

// checkSchema sẽ mặc định check cả tất cả
// 'body' | 'cookies' | 'headers' | 'params' | 'query'
// nếu chỉ muốn check body thì chỉ thêm body như là dependency
// để nhanh hơn, cải thiện performance

export const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: 'ObjectId is invalid',
          status: HTTP_STATUS.NOT_FOUND
        });
      }
      const followed_user = usersService.getInfo(value);
      if (!followed_user) {
        throw new ErrorWithStatus({
          message: 'User not found',
          status: HTTP_STATUS.NOT_FOUND
        });
      }
    }
  }
};

const nameSchema: ParamSchema = {
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    }
  }
};

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
};

const passwordSchema: ParamSchema = {
  notEmpty: true,
  isStrongPassword: {
    options: {
      minLength: 6
    }
  }
};

const confirmPasswordSchema: ParamSchema = {
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
};

const imageSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 200
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
            privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
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
      isEmail: true,
      trim: true,
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
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    name: nameSchema,
    date_of_birth: dateOfBirthSchema,
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
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
    }
  },
  ['body']
);

const accessTokenSchema = checkSchema(
  {
    Authorization: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const access_token = (value || '').split(' ')[1];
          return verifyAccessToken(access_token, req as Request);
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
                privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string
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
              privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
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
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    ...forgotPasswordTokenSchema
  },
  ['body']
);

export const verifiedUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verify } = req.decoded_authorization as TokenPayload;

  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: 'User not verified',
        status: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  next();
};

const updateInfoSchema = checkSchema(
  {
    name: { ...nameSchema, optional: true, notEmpty: undefined },
    date_of_birth: { ...dateOfBirthSchema, optional: true },
    bio: {
      optional: true,
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200
        }
      }
    },
    location: {
      optional: true,
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200
        }
      }
    },
    website: {
      optional: true,
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200
        }
      }
    },
    username: {
      optional: true,
      isString: true,
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!/^(?![0-9]+$)[A-Za-z0-9_]{4,15}$/.test(value)) {
            throw new Error('Username invalid');
          }

          const user = await databaseService.users.findOne({ username: value });
          if (user) {
            throw new Error('Username existed');
          }
          return true;
        }
      }
    },
    avatar: imageSchema,
    cover_photo: imageSchema
  },
  ['body']
);

const followSchema = checkSchema(
  {
    followed_user_id: userIdSchema
  },
  ['body']
);

const unfollowSchema = checkSchema(
  {
    user_id: userIdSchema
  },
  ['params']
);

const changePasswordSchema = checkSchema(
  {
    old_password: passwordSchema,
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  },
  ['body']
);

export const isUserLoggedInValidator =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next);
    }
    next();
  };

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
export const updateInfoValidator = validate(updateInfoSchema);
export const followValidator = validate(followSchema);
export const unfollowValidator = validate(unfollowSchema);
export const changePasswordValidator = validate(changePasswordSchema);
