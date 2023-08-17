import express from 'express';
import omit from 'lodash/omit';
import HTTP_STATUS from '~/constants/httpStatus';

export const defaultErrorHandler = (
  err: { status: HTTP_STATUS },
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res
    .status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(omit(err, 'status'));
};
