import { sign, SignOptions, verify } from 'jsonwebtoken';
import { TokenPayload } from '~/models/requests/User.requests';

type SignTokenParams = {
  payload: string | Buffer | object;
  privateKey?: string;
  options?: SignOptions;
};

type VerifyTokenParams = {
  token: string;
  privateKey?: string;
};

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: SignTokenParams) => {
  return new Promise<string>((resolve, reject) => {
    sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error);
      }
      resolve(token as string);
    });
  });
};

export const verifyToken = ({
  token,
  privateKey = process.env.JWT_SECRET as string
}: VerifyTokenParams) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    verify(token, privateKey, (error, decoded) => {
      if (error) {
        throw reject(error);
      }
      resolve(decoded as TokenPayload);
    });
  });
};
