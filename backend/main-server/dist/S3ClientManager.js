"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3CLientManager {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_ACCESS_KEY_ID',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'AWS_SECRET_ACCESS_KEY'
            },
            region: process.env.AWS_BUCKET_REGION || 'AWS_BUCKET_REGION'
        });
    }
    addMedia(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const putObjectCommand = new client_s3_1.PutObjectCommand({ Bucket: params.bucketName, Key: params.unqMediaName, Body: params.bufferData, ContentType: params.contentType });
            yield this.s3Client.send(putObjectCommand);
        });
    }
    getMedia(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const getObjectComand = new client_s3_1.GetObjectCommand({ Bucket: params.bucketName, Key: params.unqMediaName });
            return yield (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, getObjectComand, { expiresIn: 60 * 60 * 24 * 7 });
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new S3CLientManager();
        }
        return this.instance;
    }
}
exports.default = S3CLientManager;
