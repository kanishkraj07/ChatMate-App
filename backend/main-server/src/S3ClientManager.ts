import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export interface AddMediaParams {
    bucketName: string,
    unqMediaName: string,
    bufferData: Buffer,
    contentType: string
}

export interface GetMediaParams {
    bucketName: string,
    unqMediaName: string
}

class S3CLientManager {
    private static instance: S3CLientManager;
    private s3Client: S3Client;
   
    private constructor() {
        this.s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_ACCESS_KEY_ID',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'AWS_SECRET_ACCESS_KEY'
            },
            region: process.env.AWS_BUCKET_REGION || 'AWS_BUCKET_REGION'
        });
    }

    public async addMedia(params: AddMediaParams) {
        const putObjectCommand = new PutObjectCommand({Bucket: params.bucketName, Key: params.unqMediaName, Body: params.bufferData,  ContentType: params.contentType});
        await this.s3Client.send(putObjectCommand)
    }

    public async getMedia(params: GetMediaParams): Promise<string> {
        const getObjectComand = new GetObjectCommand({Bucket: params.bucketName, Key: params.unqMediaName});
        return await getSignedUrl(this.s3Client, getObjectComand, {expiresIn: 60 * 60 * 24 * 7})
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new S3CLientManager();
        }
        return this.instance;
    }

}

export default S3CLientManager;