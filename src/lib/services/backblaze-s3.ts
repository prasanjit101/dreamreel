import { S3Client } from '@aws-sdk/client-s3';
import { env } from 'env';

export const s3 = new S3Client({
    endpoint: env.BACKBLAZE_ENDPOINT,
    region: env.BACKBLAZE_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
});

export const B2_BUCKET_NAME = 'dreamreel';
