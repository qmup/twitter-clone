import { NextFunction, Request, Response } from 'express';
import path from 'path';
import { UPLOAD_DIR } from '~/constants/dir';
import mediasService from '~/services/medias.services';

export const uploadSingleImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await mediasService.handleUploadSingleImage(req);

  return res.json({ result, message: 'Upload success' });
};

export const serveImageController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err: any) => {
    if (err) {
      res.status(err.status).send({ message: 'Not found' });
    }
  });
};
