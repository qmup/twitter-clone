import express from 'express';

export const wrapRequestHandler =
  <T>(func: express.RequestHandler<T, any, any, any>) =>
  async (
    req: express.Request<T>,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
