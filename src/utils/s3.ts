import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import { envConfig } from '~/constants/config';

const s3 = new S3({
  region: envConfig.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY_1 as string,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID_1 as string
  }
});

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string;
  filepath: string;
  contentType: string;
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: envConfig.AWS_BUCKET as string,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },

    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  });

  return parallelUploads3.done();
};
