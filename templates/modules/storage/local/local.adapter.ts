import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { StorageAdapter, SignedUpload } from "../../../../packages/module-kit/src/index.js";

export class LocalStorageAdapter implements StorageAdapter {
  readonly provider = "local" as const;
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads");
    this.publicBaseUrl = process.env.PUBLIC_STORAGE_URL || "http://localhost:4000/uploads";

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getUploadUrl(input: {
    folder: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<SignedUpload> {
    const extension = input.contentType.split("/")[1] || "bin";
    const key = `${input.folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;

    // Target endpoint hosted on backend
    const url = `${this.publicBaseUrl.replace(/\/+$/, "")}/direct/${key}`;

    return {
      key,
      method: "PUT",
      url,
      headers: {
        "Content-Type": input.contentType
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Idempotent
      }
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl.replace(/\/+$/, "")}/${key}`;
  }
}

export const localAdapter = new LocalStorageAdapter();

