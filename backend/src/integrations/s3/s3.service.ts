import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client | null;
  private readonly bucket: string;
  private readonly region: string;
  private readonly useLocalFallback: boolean;
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('aws.region', 'ap-south-1');
    this.bucket = this.configService.get<string>('aws.s3Bucket', 'it-connect-matrimony-uploads');

    const accessKeyId = this.configService.get<string>('aws.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey', '');

    this.useLocalFallback = !accessKeyId || !secretAccessKey;
    this.uploadsDir = path.join(process.cwd(), 'uploads');

    if (this.useLocalFallback) {
      this.logger.warn('AWS credentials not configured, using local file storage fallback');
      this.s3 = null;
    } else {
      this.s3 = new S3Client({
        region: this.region,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimetype: string,
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(originalName);
    const key = `${folder}/${uuid()}${ext}`;

    if (this.useLocalFallback || !this.s3) {
      return this.uploadLocal(buffer, key, mimetype);
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
      }),
    );

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { key, url };
  }

  private async uploadLocal(
    buffer: Buffer,
    key: string,
    _mimetype: string,
  ): Promise<{ key: string; url: string }> {
    const filePath = path.join(this.uploadsDir, key);
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    const url = `/uploads/${key}`;
    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useLocalFallback || !this.s3) {
      const filePath = path.join(this.uploadsDir, key);
      try {
        fs.unlinkSync(filePath);
      } catch {
        this.logger.warn(`Failed to delete local file: ${key}`);
      }
      return;
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete S3 file: ${key}`, error);
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.useLocalFallback || !this.s3) {
      return `/uploads/${key}`;
    }
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn },
    );
  }
}
