export interface SignedUpload {
  key: string;
  method: "PUT" | "POST";
  url: string;
  fields?: Record<string, string>;  // form fields for POST uploads (e.g. Cloudinary)
  headers?: Record<string, string>; // headers for PUT uploads (e.g. S3 presigned URLs)
  expiresAt: Date;
}

export interface StoredFile {
  key: string;
  provider: "cloudinary" | "s3" | "local";
  alt?: string;
}

export interface StorageAdapter {
  readonly provider: "cloudinary" | "s3" | "local";

  /**
   * Generates a signed direct-upload URL for the browser.
   * Key should be generated server-side.
   */
  getUploadUrl(input: {
    folder: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<SignedUpload>;

  /**
   * Idempotently deletes a stored file by key.
   * If the key does not exist, does not throw.
   */
  delete(key: string): Promise<void>;

  /**
   * Synchronous helper to generate the public URL for a given file key.
   * Must not make network requests.
   */
  getPublicUrl(
    key: string,
    opts?: {
      width?: number;
      height?: number;
      format?: "webp" | "avif";
    }
  ): string;
}

