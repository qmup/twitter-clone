import { Request } from 'express';
import { ParamSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { envConfig } from '~/constants/config';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { verifyToken } from './jwt';

export type RequestSchema<T> = {
  [K in keyof T]?: ParamSchema;
};

export const numberEnumToArray = (
  numberEnum: Record<string, string | number>
) => Object.values(numberEnum).filter((v) => typeof v === 'number') as number[];

export const verifyAccessToken = async (
  access_token: string,
  req?: Request
) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'Token is required'
    });
  }

  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
    });

    if (req) {
      (req as Request).decoded_authorization = decoded_authorization;
      return decoded_authorization;
    }
    return true;
  } catch (error) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: (error as JsonWebTokenError).message
    });
  }
};
