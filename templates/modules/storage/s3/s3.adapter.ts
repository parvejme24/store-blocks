import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { StorageAdapter, SignedUpload } from "../../../../packages/module-kit/src/index.js";

export class S3StorageAdapter implements StorageAdapter {
  readonly provider = "s3" as const;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "";
    this.publicUrl = process.env.S3_PUBLIC_URL;

    this.client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
      },
      forcePathStyle: Boolean(process.env.S3_ENDPOINT) // Use path style for MinIO / local dev
    });
  }

  async getUploadUrl(input: {
    folder: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<SignedUpload> {
    const extension = input.contentType.split("/")[1] || "bin";
    const key = `${input.folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.sizeBytes
    });

    const expiresInSeconds = 600; // 10 minutes
    const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    return {
      key,
      method: "PUT",
      url,
      headers: {
        "Content-Type": input.contentType
      },
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000)
    };
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      await this.client.send(command);
    } catch {
      // Idempotent: ignore missing key errors
    }
  }

  getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/+$/, "")}/${key}`;
    }
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      return `${endpoint.replace(/\/+$/, "")}/${this.bucket}/${key}`;
    }
    const region = process.env.S3_REGION || "us-east-1";
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

export const s3Adapter = new S3StorageAdapter();

