import express from 'express';

export const wrapRequestHandler =
  (func: express.RequestHandler) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
