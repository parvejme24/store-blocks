import { Router, Request, Response, NextFunction } from "express";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import { ProductService } from "../../products/backend/products.service.js";

export function createSocialRouter(prodRepo = productRepository): Router {
  const router = Router();
  const productService = new ProductService(prodRepo);

  router.get("/share-links/:slug", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug!;
      const product = await productService.getProductBySlug(slug);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const productUrl = encodeURIComponent(`${frontendUrl}/products/slug/${product.slug}`);
      const title = encodeURIComponent(product.name);

      const links = {
        whatsapp: `https://api.whatsapp.com/send?text=${title}%20${productUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${title}&url=${productUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${productUrl}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${productUrl}&description=${title}`
      };

      res.status(200).json({
        success: true,
        data: links
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/feed.xml", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items } = await productService.getProducts({ limit: 100 });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      let xml = `<?xml version="1.0"?>\n`;
      xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>StoreBlocks Catalog Feed</title>\n`;
      xml += `    <link>${frontendUrl}</link>\n`;
      xml += `    <description>Product catalog feed for Google Merchant Center and Meta Catalog</description>\n`;

      for (const item of items) {
        xml += `    <item>\n`;
        xml += `      <g:id>${item.id}</g:id>\n`;
        xml += `      <g:title><![CDATA[${item.name}]]></g:title>\n`;
        xml += `      <g:description><![CDATA[${item.description || item.name}]]></g:description>\n`;
        xml += `      <g:link>${frontendUrl}/products/slug/${item.slug}</g:link>\n`;
        if (item.images?.[0]) {
          xml += `      <g:image_link>${item.images[0].key}</g:image_link>\n`;
        }
        xml += `      <g:price>${(item.priceMinor / 100).toFixed(2)} ${item.currency}</g:price>\n`;
        xml += `      <g:availability>${item.stock > 0 ? "in stock" : "out of stock"}</g:availability>\n`;
        xml += `      <g:condition>new</g:condition>\n`;
        xml += `    </item>\n`;
      }

      xml += `  </channel>\n`;
      xml += `</rss>`;

      res.set("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const socialRouter = createSocialRouter();

