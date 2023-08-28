import { Request } from 'express';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { isEmpty } from 'lodash';
import { UPLOAD_TEMP_DIR } from '~/constants/dir';

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // nếu path là nested thì sẽ ko lỗi (e.x. uploads/images)
    });
  }
};

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 400 * 1024, // 4MB,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'image' && !!mimetype?.includes('image/');
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }
      return valid;
    }
  });

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (isEmpty(files)) {
        return reject(new Error('File is required!'));
      }
      resolve((files.image as File[])[0]);
    });
  });
};

export const getNameFromFullname = (fullname: string) => {
  return fullname.split('.')[0];
};
