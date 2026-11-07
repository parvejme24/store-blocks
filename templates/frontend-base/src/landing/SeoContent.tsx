import { ChevronDown } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const FAQS = [
  {
    question: "What is StoreBlocks?",
    answer:
      "StoreBlocks is an open-source command-line tool that creates a complete e-commerce store. It generates a backend API, a Next.js storefront and an admin dashboard, with only the features you select."
  },
  {
    question: "Which store types can I build?",
    answer:
      "You can start from grocery, fashion, beauty and cosmetics, medicine and pharmacy, organic and natural food, electronics, or a general store. Each type has its own theme, layout and demo catalogue."
  },
  {
    question: "Which databases and payment providers are supported?",
    answer:
      "The backend supports MongoDB with Mongoose and PostgreSQL with Drizzle ORM. Payments include cash on delivery, SSLCommerz and Stripe. Media can be stored on Cloudinary, Amazon S3 or local disk."
  },
  {
    question: "Does a new store come with demo products?",
    answer:
      "No. A fresh install connects the storefront to your API and shows no products. Add products in the admin dashboard and they appear on the storefront. The theme demos use separate sample data."
  },
  {
    question: "How do I install StoreBlocks?",
    answer:
      "Run npx create-storeblocks my-shop, copy .env.example to backend/.env, add your keys, then run npm run dev from the project root. The storefront runs on port 3000 and the API on port 4000."
  },
  {
    question: "Is the generated code mine to keep?",
    answer:
      "Yes. The generator writes plain code into your project folder. The project includes a README that lists the features you installed, the environment variable names you need and the run steps."
  }
];

/**
 * Crawlable SEO content for the home page: a plain-language summary, an FAQ and
 * structured data (WebSite, SoftwareApplication, FAQPage) for search engines.
 */
export function SeoContent() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      description:
        "Open-source CLI that scaffolds a full-stack e-commerce store with an API, storefront and admin dashboard.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: SITE_URL
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    }
  ];

  return (
    <section aria-labelledby="about-storeblocks" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <script
        type="application/ld+json"
        // Static, developer-written structured data. No user input is included.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <div className="space-y-5 text-center">
        <h2 id="about-storeblocks" className="text-3xl font-bold tracking-tight sm:text-4xl">
          About StoreBlocks
        </h2>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          StoreBlocks helps agencies, freelancers and small businesses launch online shops faster. It writes only the
          code for the features you choose, connects a storefront to a real API, and includes an admin dashboard for
          products, orders, customers and promotions. Use it for grocery, fashion, cosmetics, medicine, organic food
          or electronics stores.
        </p>
      </div>

      <div className="mt-12">
        <h3 className="mb-6 text-center text-xl font-semibold sm:text-2xl">Frequently asked questions</h3>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group p-5 open:bg-accent/30 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
