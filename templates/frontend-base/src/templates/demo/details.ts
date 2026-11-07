/**
 * Demo product details (brand, description, highlights) for each theme's sample products.
 * Keyed by theme id, then by product id. Kept apart from the theme files so every
 * theme's sample catalogue stays as it was.
 */

export type ProductDetail = {
  brand: string;
  description: string;
  highlights: string[];
};

const FALLBACK: ProductDetail = {
  brand: "StoreBlocks",
  description: "A demo product. Connect the catalogue API to replace this with real product details.",
  highlights: ["Demo product", "Ships within 2 to 4 days"]
};

export const DEMO_DETAILS: Record<string, Record<string, ProductDetail>> = {
  default: {
    d1: { brand: "Northfield", description: "A crisp everyday shirt in pure cotton with a soft collar and a relaxed fit.", highlights: ["100% cotton Oxford weave", "Button-down collar", "Machine washable"] },
    d2: { brand: "Harbor & Co.", description: "A structured blazer cut from Italian wool, tailored for both office and evening wear.", highlights: ["Italian virgin wool", "Half-canvas construction", "Dry clean recommended"] },
    d3: { brand: "Atlas Goods", description: "A full-grain leather backpack with a padded laptop sleeve and clean, minimal lines.", highlights: ["Full-grain leather", "Fits 14-inch laptops", "Two-year warranty"] },
    d4: { brand: "Circuit Works", description: "A hot-swappable mechanical keyboard with a solid aluminium frame and per-key RGB.", highlights: ["Hot-swap switch sockets", "Aluminium case", "USB-C, detachable cable"] },
    d5: { brand: "Green Fields", description: "Single-origin beans roasted in small batches for a bright, chocolatey cup.", highlights: ["500 g whole beans", "Roasted to order", "Notes of cacao and citrus"] },
    d6: { brand: "Atlas Goods", description: "A lumbar-support desk chair with breathable mesh and adjustable arms.", highlights: ["Adjustable lumbar support", "4D armrests", "Supports up to 130 kg"] }
  },
  fashion: {
    f1: { brand: "Linen House", description: "A relaxed-fit linen shirt that gets softer with every wash, ideal for warm days.", highlights: ["100% European linen", "Relaxed fit", "Mother-of-pearl buttons"] },
    f2: { brand: "Atelier North", description: "A double-breasted wool-blend overcoat with a clean silhouette and a generous collar.", highlights: ["Wool and cashmere blend", "Lined throughout", "Hidden inner pockets"] },
    f3: { brand: "Linen House", description: "A pleated midi skirt with a fluid drape and an elasticated waistband.", highlights: ["Crepe fabric", "Pleated, midi length", "Hand wash cold"] },
    f4: { brand: "Atelier North", description: "A structured tote in vegetable-tanned leather with a magnetic closure and a zip pocket.", highlights: ["Vegetable-tanned leather", "Fits A4 documents", "Detachable strap"] },
    f5: { brand: "Merino Lane", description: "A fine-gauge merino crewneck that is warm without bulk and keeps its shape.", highlights: ["100% merino wool", "Ribbed cuffs and hem", "Naturally odour-resistant"] },
    f6: { brand: "Merino Lane", description: "Tapered chinos in a soft stretch cotton with a clean front and a comfortable rise.", highlights: ["Stretch cotton twill", "Tapered leg", "Off-duty to smart-casual"] }
  },
  grocery: {
    g1: { brand: "Morning Farm", description: "Free-range farm eggs, collected daily and packed in a recyclable tray.", highlights: ["Free-range hens", "Pack of 12", "Keep refrigerated"] },
    g2: { brand: "Green Fields", description: "Organic bananas picked ripe and delivered within a day of harvest.", highlights: ["Certified organic", "About 1 kg", "Sold by weight"] },
    g3: { brand: "Pantry Co.", description: "A naturally leavened sourdough loaf with a crisp crust and an open, chewy crumb.", highlights: ["Slow-fermented, 24 hours", "Baked each morning", "No preservatives"] },
    g4: { brand: "Morning Farm", description: "Fresh whole milk, pasteurised and bottled locally.", highlights: ["Whole milk, 3.5% fat", "Bottled locally", "Best before 5 days"] },
    g5: { brand: "Green Fields", description: "Cold-pressed orange juice with no added sugar and no concentrate.", highlights: ["100% orange", "Cold-pressed", "No added sugar"] },
    g6: { brand: "Pantry Co.", description: "Long-grain basmati rice, aged for aroma and a light, fluffy texture.", highlights: ["Aged basmati", "5 kg bag", "Store in a cool, dry place"] }
  },
  cosmetics: {
    c1: { brand: "Rose Lab", description: "A lightweight serum with hyaluronic acid to plump and hydrate skin through the day.", highlights: ["Hyaluronic acid", "Fragrance-free", "Suitable for sensitive skin"] },
    c2: { brand: "Dew Skin", description: "A gentle, low-foam cleanser that removes make-up without stripping the skin.", highlights: ["Low-foam formula", "pH balanced", "For all skin types"] },
    c3: { brand: "Petal & Oak", description: "A velvet matte lip tint in a comfortable, long-wear shade that does not dry the lips.", highlights: ["Matte finish", "Long-wear", "Vegan formula"] },
    c4: { brand: "Dew Skin", description: "A mineral sunscreen with SPF 50 and broad-spectrum protection, with no white cast.", highlights: ["SPF 50, PA++++", "Mineral filters", "Water resistant, 80 min"] },
    c5: { brand: "Petal & Oak", description: "A weekly repair mask that softens and strengthens dry or damaged hair.", highlights: ["Keratin and argan oil", "Use once a week", "Sulfate-free"] },
    c6: { brand: "Rose Lab", description: "A vitamin C cream that brightens dull skin and evens tone over time.", highlights: ["Stabilised vitamin C", "Brightening", "Use in the morning"] }
  },
  medicine: {
    m1: { brand: "CareWell", description: "Fast-acting tablets for headache, muscle ache and fever relief. Read the leaflet before use.", highlights: ["20 tablets per pack", "Fast-acting", "Consult a pharmacist if unsure"] },
    m2: { brand: "Pure Health", description: "A daily multivitamin with essential vitamins and minerals to support everyday wellbeing.", highlights: ["30 tablets", "One tablet a day", "Not a substitute for a balanced diet"] },
    m3: { brand: "FirstAid Plus", description: "A fast, accurate digital thermometer with a clear display and memory recall.", highlights: ["Reads in about 10 seconds", "Fever alarm", "Memory of last readings"] },
    m4: { brand: "CareWell", description: "Gentle, alcohol-free baby wipes that are safe for delicate skin.", highlights: ["Alcohol-free", "80 wipes per pack", "Dermatologically tested"] },
    m5: { brand: "FirstAid Plus", description: "A complete home first-aid kit with dressings, antiseptic and a sturdy storage case.", highlights: ["Over 50 essential items", "Wall-mount case", "Check expiry dates yearly"] },
    m6: { brand: "Pure Health", description: "A soothing cough syrup for dry and irritating coughs. Read the label for dosage.", highlights: ["100 ml bottle", "Soothing formula", "Not for children under 2"] }
  },
  organic: {
    o1: { brand: "Wild Harvest", description: "Raw wild forest honey, lightly filtered to keep its natural enzymes and floral notes.", highlights: ["Raw and unheated", "500 g jar", "Single-source forest honey"] },
    o2: { brand: "Earth Mill", description: "Cold-pressed mustard oil with a sharp, nutty flavour, ideal for cooking and pickles.", highlights: ["Cold-pressed", "1 litre bottle", "Stone-ground seeds"] },
    o3: { brand: "Hill Farm", description: "Loose-leaf green tea with a fresh, grassy flavour, hand-picked from small estates.", highlights: ["Loose leaf", "100 g pouch", "Brew at 80 degrees"] },
    o4: { brand: "Wild Harvest", description: "Roasted almonds with no added salt or oil, a naturally crunchy snack.", highlights: ["No added salt", "250 g pack", "Store airtight"] },
    o5: { brand: "Earth Mill", description: "Whole wheat flour stone-ground in small batches to keep the bran and germ.", highlights: ["Stone-ground", "2 kg bag", "Ideal for chapati and bread"] },
    o6: { brand: "Hill Farm", description: "Ground turmeric with a deep colour and earthy warmth, sourced from small farms.", highlights: ["200 g pack", "Vibrant colour", "Keep dry and sealed"] }
  },
  electronics: {
    e1: { brand: "Circuit Works", description: "A 14-inch ultrabook with a fast processor, all-day battery life and a light aluminium body.", highlights: ["14-inch 2.8K display", "All-day battery", "1.2 kg aluminium body"] },
    e2: { brand: "Pulse Audio", description: "Over-ear wireless headphones with adaptive noise cancelling and 30 hours of playback.", highlights: ["Active noise cancelling", "30-hour battery", "Bluetooth 5.3"] },
    e3: { brand: "Circuit Works", description: "A compact 75% keyboard with hot-swap sockets, gasket mount and a quiet typing feel.", highlights: ["Hot-swap sockets", "Gasket mount", "Wireless and wired modes"] },
    e4: { brand: "Northwave", description: "A 27-inch 4K IPS monitor with wide colour gamut and a thin bezel on three sides.", highlights: ["4K IPS panel", "99% sRGB", "USB-C with 65 W power delivery"] },
    e5: { brand: "Pulse Audio", description: "Compact wireless earbuds with a sealed fit, wireless charging case and clear calls.", highlights: ["Up to 7 hours playback", "Wireless charging case", "IPX4 sweat resistance"] },
    e6: { brand: "Northwave", description: "A 16 GB gaming laptop with a high-refresh display and a powerful graphics card.", highlights: ["16 GB RAM", "165 Hz display", "RGB backlit keyboard"] }
  }
};

export function getProductDetail(themeId: string, productId: string): ProductDetail {
  return DEMO_DETAILS[themeId]?.[productId] ?? FALLBACK;
}
