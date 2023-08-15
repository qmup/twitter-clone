import { sign, SignOptions } from 'jsonwebtoken';

type SignTokenParams = {
  payload: string | Buffer | object;
  privateKey?: string;
  options?: SignOptions;
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
