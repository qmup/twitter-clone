import { Request } from 'express';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { isEmpty } from 'lodash';
import {
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_DIR,
  UPLOAD_VIDEO_TEMP_DIR
} from '~/constants/dir';

export const initFolder = () => {
  [UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // nếu path là nested thì sẽ ko lỗi (e.x. uploads/images)
      });
    }
  });
};

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300Kb,
    maxTotalFileSize: 300 * 1024 * 4, // 300Kb * 4,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && !!mimetype?.includes('image/');
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (isEmpty(files)) {
        return reject(new Error('File is required!'));
      }
      resolve(files.image as File[]);
    });
  });
};

export const handleUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 4,
    maxFileSize: 4 * 50 * 1024 * 1024, // 50Mb
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'video' && !!mimetype?.includes('mp4');
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    }
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (isEmpty(files)) {
        return reject(new Error('File is required!'));
      }
      const videos = files.video as File[];
      videos.forEach((video) => {
        const ext = getExtention(video.originalFilename as string);
        fs.renameSync(video.filepath, video.filepath + ext);
        video.newFilename = video.newFilename + ext;
        video.filepath = video.filepath + ext;
      });
      resolve(videos);
    });
  });
};

export const getNameFromFullname = (fullname: string) => {
  return fullname.split('.')[0];
};

export const getExtention = (fullname: string) => {
  return '.' + fullname.split('.')[fullname.split('.').length - 1];
};
