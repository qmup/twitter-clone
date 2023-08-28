import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import mime from 'mime';
import path from 'path';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';
import HTTP_STATUS from '~/constants/httpStatus';
import mediasService from '~/services/medias.services';

export const uploadImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await mediasService.handleUploadImage(req);

  return res.json({ result, message: 'Upload success' });
};

export const uploadVideoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await mediasService.handleUploadVideo(req);

  return res.json({ result, message: 'Upload success' });
};

export const serveImageController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err: any) => {
    if (err) {
      res.status(err.status).send({ message: 'Not found' });
    }
  });
};

export const serveVideoStreamController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { range } = req.headers;
  if (!range) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send({ message: 'Requires range header' });
  } else {
    const { name } = req.params;
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
    const videoSize = fs.statSync(videoPath).size;
    const chunkSize = 10 ** 6; // 1MB;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, videoSize);
    const contentLength = end - start;
    const contentType = mime.getType(videoPath) || 'video/*';
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Range': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    };
    res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
    const videoStreams = fs.createReadStream(videoPath, { start, end });
    videoStreams.pipe(res);
  }
};
