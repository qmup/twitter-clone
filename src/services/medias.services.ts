import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import { Request } from 'express';
import fsPromises from 'fs/promises';
import mime from 'mime';
import path from 'path';
import sharp from 'sharp';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MediaType } from '~/constants/enums';
import { Media } from '~/models/Others';
import {
  getNameFromFullname,
  handleUploadImage,
  handleUploadVideo
} from '~/utils/file';
import { uploadFileToS3 } from '~/utils/s3';

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename);
        const newFullName = `${newName}.jpg`;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName);
        await sharp(file.filepath).jpeg().toFile(newPath);

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        });

        await Promise.all([
          fsPromises.unlink(file.filepath),
          fsPromises.unlink(newPath)
        ]);

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput)
            .Location as string,
          type: MediaType.Image
        };
      })
    );
    return result;
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req);

    const result = await Promise.all(
      files.map(async (file) => {
        const { newFilename, filepath } = file;
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + newFilename,
          filepath: filepath,
          contentType: mime.getType(filepath) as string
        });

        await fsPromises.unlink(filepath);

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput)
            .Location as string,
          type: MediaType.Video
        };
      })
    );

    return result;
  }
}

const mediasService = new MediasService();

export default mediasService;
