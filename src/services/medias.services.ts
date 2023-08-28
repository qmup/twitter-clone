import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { isProduction } from '~/constants/config';
import { UPLOAD_DIR } from '~/constants/dir';
import { getNameFromFullname, handleuploadImage } from '~/utils/file';

class MediasService {
  async handleuploadImage(req: Request) {
    const file = await handleuploadImage(req);
    const newName = getNameFromFullname(file.newFilename);
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`);
    await sharp(file.filepath).jpeg().toFile(newPath);
    fs.unlinkSync(file.filepath);
    return isProduction
      ? `${process.env.HOST}/static/image/${newName}.jpg`
      : `http://localhost:4000/static/image/${newName}.jpg`;
  }
}

const mediasService = new MediasService();

export default mediasService;
