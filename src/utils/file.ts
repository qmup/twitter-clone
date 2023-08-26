import { Request } from 'express';
import formidable, { Files } from 'formidable';
import fs from 'fs';
import { isEmpty } from 'lodash';
import path from 'path';

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads');
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // nếu path là nested thì sẽ ko lỗi (e.x. uploads/images)
    });
  }
};

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && !!mimetype?.includes('image/');
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    }
  });
  return new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (isEmpty(files)) {
        return reject(new Error('File is required!'));
      }
      resolve(files);
    });
  });
};
