import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { isProduction } from '~/constants/config';
import { UPLOAD_DIR } from '~/constants/dir';
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file';

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req);
    const newName = getNameFromFullname(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath);
    fs.unlinkSync(file.filepath);
    return isProduction
      ? `${process.env.HOST}/medias/${newName}.jpg`
      : `http://localhost:4000/medias/${newName}.jpg`;
  }
}

const mediasService = new MediasService();

export default mediasService;
