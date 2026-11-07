import { StorageAdapter } from "../contracts/storage.js";

export interface StorageTestFixture {
  adapter: StorageAdapter;
  testFolder?: string;
}

export function describeStorageContract(
  fixture: StorageTestFixture,
  testRunner: {
    describe: (name: string, fn: () => void) => void;
    it: (name: string, fn: () => void | Promise<void>) => void;
    expect: any;
  }
) {
  const { describe, it, expect } = testRunner;

  describe(`Storage Contract: ${fixture.adapter.provider}`, () => {
    it("generates a signed upload object with key, url, and expiry", async () => {
      const upload = await fixture.adapter.getUploadUrl({
        folder: fixture.testFolder || "products",
        contentType: "image/webp",
        sizeBytes: 1024 * 50
      });

      expect(upload).toBeDefined();
      expect(typeof upload.key).toBe("string");
      expect(upload.key.length).toBeGreaterThan(0);
      expect(["PUT", "POST"]).toContain(upload.method);
      expect(typeof upload.url).toBe("string");
      expect(upload.url.startsWith("http")).toBe(true);
      expect(upload.expiresAt instanceof Date).toBe(true);
      expect(upload.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("generates a public URL synchronously without throwing", () => {
      const publicUrl = fixture.adapter.getPublicUrl("test-uploads/sample-key.webp");
      expect(typeof publicUrl).toBe("string");
      expect(publicUrl.length).toBeGreaterThan(0);
    });

    it("deleting a non-existent key completes idempotently without throwing", async () => {
      await expect(
        fixture.adapter.delete("non-existent-key-000000.jpg")
      ).resolves.not.toThrow();
    });
  });
}
