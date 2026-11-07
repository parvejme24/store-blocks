import { v2 as cloudinary } from "cloudinary";
import crypto from "node:crypto";
import { StorageAdapter, SignedUpload } from "../../../../packages/module-kit/src/index.js";

export class CloudinaryAdapter implements StorageAdapter {
  readonly provider = "cloudinary" as const;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async getUploadUrl(input: {
    folder: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<SignedUpload> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const key = `${input.folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const paramsToSign = {
      folder: input.folder,
      public_id: pathWithoutFolder(key, input.folder),
      timestamp
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";

    return {
      key,
      method: "POST",
      url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      fields: {
        api_key: apiKey,
        timestamp: timestamp.toString(),
        signature,
        folder: input.folder,
        public_id: pathWithoutFolder(key, input.folder)
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key);
    } catch {
      // Idempotent: ignore missing key errors
    }
  }

  getPublicUrl(
    key: string,
    opts?: {
      width?: number;
      height?: number;
      format?: "webp" | "avif";
    }
  ): string {
    return cloudinary.url(key, {
      transformation: [
        ...(opts?.width || opts?.height
          ? [{ width: opts.width, height: opts.height, crop: "limit" }]
          : []),
        ...(opts?.format ? [{ fetch_format: opts.format }] : [])
      ],
      secure: true
    });
  }
}

function pathWithoutFolder(key: string, folder: string): string {
  if (key.startsWith(`${folder}/`)) {
    return key.substring(folder.length + 1);
  }
  return key;
}

export const cloudinaryAdapter = new CloudinaryAdapter();

