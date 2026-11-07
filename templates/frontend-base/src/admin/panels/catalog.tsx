"use client";

import { useRef, useState } from "react";
import { Boxes, FolderTree, ImageIcon, Package, Plus, Star, Tag, MessageSquareText, Warehouse } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Select } from "@/components/ui/Select";
import {
  brandSchema,
  categorySchema,
  fromMinor,
  formatKeywords,
  newId,
  parseKeywords,
  parseLines,
  PRODUCT_STATUS_OPTIONS,
  productSchema,
  toInt,
  toMinor,
  useEntityForm,
  VISIBILITY_OPTIONS
} from "../demo/schemas";
import { emptySeo, slugify, type DemoBrand, type DemoCategory, type DemoDataset, type DemoProduct, type DemoUpdate, type MediaImage, type ProductStatus } from "../demo/dataset";
import { BUTTON, ConfirmDialog, EmptyRow, EmptyState, Field, INPUT, Panel, Pill, RowActions, Sheet, SheetFooter, StatCard, Table, Td, TEXTAREA, Thumb, Toggle, Toolbar, Tr, type Tone } from "../ui/primitives";
import { GalleryUploader, ImageUploader } from "../ui/media";
import { SeoFields, seoToValues, valuesToSeo, type SeoValues } from "../ui/seo";

type SheetState = { mode: "new" } | { mode: "edit"; id: string } | null;

/* ============================ Products ============================ */

type ProductValues = SeoValues & {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  shortDescription: string;
  description: string;
  highlights: string;
  price: string;
  compareAt: string;
  cost: string;
  taxRate: string;
  stock: string;
  reorderLevel: string;
  weightGrams: string;
  tags: string;
  status: ProductStatus;
  featured: boolean;
  images: MediaImage[];
};

function productToValues(p: DemoProduct | undefined, categories: DemoCategory[]): ProductValues {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    categoryId: p?.categoryId ?? categories[0]?.id ?? "",
    brandId: p?.brandId ?? "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    highlights: p?.highlights.join("\n") ?? "",
    price: p ? fromMinor(p.priceMinor) : "",
    compareAt: p ? fromMinor(p.compareAtMinor) : "",
    cost: p ? fromMinor(p.costMinor) : "",
    taxRate: p ? String(p.taxRate) : "15",
    stock: p ? String(p.stock) : "0",
    reorderLevel: p ? String(p.reorderLevel) : "5",
    weightGrams: p ? String(p.weightGrams) : "0",
    tags: p ? formatKeywords(p.tags) : "",
    status: p?.status ?? "draft",
    featured: p?.featured ?? false,
    images: p?.images ?? [],
    ...(p ? seoToValues(p.seo) : { metaTitle: "", metaDescription: "", keywords: "", noindex: false })
  };
}

function ProductForm({
  existing,
  data,
  storeName,
  onSave,
  onCancel
}: {
  existing?: DemoProduct;
  data: DemoDataset;
  storeName: string;
  onSave: (product: DemoProduct) => void;
  onCancel: () => void;
}) {
  const form = useEntityForm(productToValues(existing, data.categories), productSchema);
  const { values, errors, set, patch, fail } = form;
  const slugTouched = useRef(Boolean(existing));
  const margin =
    values.price.trim() && Number(values.price) > 0 && values.cost.trim()
      ? Math.round(((Number(values.price) - Number(values.cost)) / Number(values.price)) * 100)
      : null;

  function onName(name: string) {
    patch({ name, ...(slugTouched.current ? {} : { slug: slugify(name) }) });
  }

  const submit = form.submit((v) => {
    const taken = data.products.some((p) => p.slug === v.slug.trim() && p.id !== existing?.id);
    if (taken) return fail("slug", "Another product already uses this URL slug.");
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      id: existing?.id ?? newId("prod"),
      name: v.name.trim(),
      slug: v.slug.trim(),
      sku: v.sku.trim().toUpperCase(),
      barcode: v.barcode.trim(),
      categoryId: v.categoryId || null,
      brandId: v.brandId || null,
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      highlights: parseLines(v.highlights),
      priceMinor: toMinor(v.price),
      compareAtMinor: v.compareAt.trim() ? toMinor(v.compareAt) : null,
      costMinor: toMinor(v.cost),
      taxRate: Number(v.taxRate) || 0,
      currency: existing?.currency ?? data.settings.currency,
      stock: toInt(v.stock),
      reorderLevel: toInt(v.reorderLevel),
      weightGrams: toInt(v.weightGrams),
      tags: parseKeywords(v.tags),
      images: v.images,
      status: v.status,
      featured: v.featured,
      seo: valuesToSeo(v),
      createdAt: existing?.createdAt ?? now
    });
  });

  const categoryOptions = data.categories.map((c) => ({ value: c.id, label: c.name }));
  const brandOptions = [{ value: "", label: "No brand" }, ...data.brands.map((b) => ({ value: b.id, label: b.name }))];

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-10 px-6 py-6">
        <FormSection title="Basics" description="What shoppers see first. The slug becomes the product URL.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" error={errors.name} className="sm:col-span-2">
              <input value={values.name} onChange={(e) => onName(e.target.value)} className={INPUT} aria-invalid={!!errors.name} />
            </Field>
            <Field label="URL slug" error={errors.slug} hint="/products/…">
              <input
                value={values.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set("slug", slugify(e.target.value));
                }}
                className={INPUT}
                aria-invalid={!!errors.slug}
              />
            </Field>
            <Field label="SKU" error={errors.sku} hint="Stock keeping unit">
              <input value={values.sku} onChange={(e) => set("sku", e.target.value)} className={`${INPUT} font-mono uppercase`} aria-invalid={!!errors.sku} />
            </Field>
            <Field control error={errors.categoryId}>
              <Select<string> label="Category" value={values.categoryId} options={categoryOptions} onChange={(v) => set("categoryId", v)} />
            </Field>
            <Field control error={errors.brandId}>
              <Select<string> label="Brand" value={values.brandId} options={brandOptions} onChange={(v) => set("brandId", v)} />
            </Field>
            <Field label="Barcode (EAN / GTIN)" error={errors.barcode} hint="Optional">
              <input value={values.barcode} onChange={(e) => set("barcode", e.target.value)} inputMode="numeric" className={`${INPUT} font-mono`} aria-invalid={!!errors.barcode} />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input value={values.tags} onChange={(e) => set("tags", e.target.value)} placeholder="gift, bestseller" className={INPUT} />
            </Field>
          </div>
          <Field label="Short description" error={errors.shortDescription} hint={`${values.shortDescription.length}/180`}>
            <textarea value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={2} className={TEXTAREA} />
          </Field>
          <Field label="Full description" error={errors.description}>
            <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={5} className={TEXTAREA} />
          </Field>
          <Field label="Highlights" hint="One per line">
            <textarea value={values.highlights} onChange={(e) => set("highlights", e.target.value)} rows={3} className={TEXTAREA} placeholder={"100% cotton\nMachine washable"} />
          </Field>
        </FormSection>

        <FormSection title="Images" description="The first image is the primary photo in listings and search results.">
          <GalleryUploader value={values.images} onChange={(images) => set("images", images)} />
        </FormSection>

        <FormSection title="Pricing and tax" description="Shoppers pay the selling price. Cost and tax are used for margin and reports.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={`Price (${data.settings.currency})`} error={errors.price}>
              <input inputMode="decimal" value={values.price} onChange={(e) => set("price", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.price} />
            </Field>
            <Field label="Compare-at price" error={errors.compareAt} hint="Shown struck through">
              <input inputMode="decimal" value={values.compareAt} onChange={(e) => set("compareAt", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.compareAt} />
            </Field>
            <Field label="Cost price" error={errors.cost} hint={margin !== null ? `Margin ${margin}%` : "Internal"}>
              <input inputMode="decimal" value={values.cost} onChange={(e) => set("cost", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.cost} />
            </Field>
            <Field label="Tax rate (%)" error={errors.taxRate}>
              <input inputMode="decimal" value={values.taxRate} onChange={(e) => set("taxRate", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.taxRate} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Inventory and shipping">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Stock on hand" error={errors.stock}>
              <input inputMode="numeric" value={values.stock} onChange={(e) => set("stock", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.stock} />
            </Field>
            <Field label="Reorder at" error={errors.reorderLevel} hint="Low-stock alert">
              <input inputMode="numeric" value={values.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.reorderLevel} />
            </Field>
            <Field label="Weight (grams)" error={errors.weightGrams}>
              <input inputMode="numeric" value={values.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.weightGrams} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Visibility">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field control>
              <Select<ProductStatus>
                label="Status"
                value={values.status}
                options={PRODUCT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, description: o.description }))}
                onChange={(v) => set("status", v)}
              />
            </Field>
            <div className="flex items-end">
              <Toggle checked={values.featured} onChange={(v) => set("featured", v)} label="Feature on the homepage" description="Shown in featured collections." />
            </div>
          </div>
        </FormSection>

        <FormSection title="Search engine optimisation" description="Controls how this product appears in Google and social previews.">
          <SeoFields
            values={values}
            onChange={patch}
            name={values.name}
            slug={values.slug}
            path="products"
            storeName={storeName}
            errors={errors}
          />
        </FormSection>
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" className={BUTTON.primary}>{existing ? "Save changes" : "Create product"}</button>
      </SheetFooter>
    </form>
  );
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function ProductsPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sheet, setSheet] = useState<SheetState>(null);
  const [pending, setPending] = useState<DemoProduct | null>(null);

  const categoryName = (id: string | null) => data.categories.find((c) => c.id === id)?.name ?? "Uncategorised";
  const brandName = (id: string | null) => data.brands.find((b) => b.id === id)?.name;
  const visible = data.products.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (category === "all" || p.categoryId === category) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  );
  const active = data.products.filter((p) => p.status === "active").length;
  const drafts = data.products.filter((p) => p.status === "draft").length;
  const lowStock = data.products.filter((p) => p.stock <= p.reorderLevel).length;
  const editing = sheet?.mode === "edit" ? data.products.find((p) => p.id === sheet.id) : undefined;

  function save(product: DemoProduct) {
    update((d) => ({
      ...d,
      products: d.products.some((p) => p.id === product.id)
        ? d.products.map((p) => (p.id === product.id ? product : p))
        : [product, ...d.products]
    }));
    setSheet(null);
  }

  function remove(product: DemoProduct) {
    update((d) => ({ ...d, products: d.products.filter((p) => p.id !== product.id) }));
    setPending(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Products" value={String(data.products.length)} hint={`${active} active · ${drafts} draft`} icon={Package} />
        <StatCard label="Low or out of stock" value={String(lowStock)} hint="Needs reordering" icon={Warehouse} />
        <StatCard label="Categories" value={String(data.categories.length)} hint={`${data.categories.filter((c) => c.status === "active").length} visible`} icon={FolderTree} />
        <StatCard label="Brands" value={String(data.brands.length)} hint="Brand pages" icon={Tag} />
      </div>

      <Panel
        title="Products"
        description="Create, edit and remove products. Edits show on the storefront once saved."
        action={
          <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New product
          </button>
        }
      >
        <Toolbar search={query} onSearch={setQuery} placeholder="Search name or SKU">
          <div className="w-40">
            <Select<string>
              label="Status filter"
              value={status}
              options={[{ value: "all", label: "All statuses" }, ...PRODUCT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
              onChange={setStatus}
            />
          </div>
          <div className="w-44">
            <Select<string>
              label="Category filter"
              value={category}
              options={[{ value: "all", label: "All categories" }, ...data.categories.map((c) => ({ value: c.id, label: c.name }))]}
              onChange={setCategory}
            />
          </div>
        </Toolbar>

        {data.products.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" body="Add your first product to start selling." action={<button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>New product</button>} />
        ) : (
          <Table head={["Product", "Category", "Price", "Stock", "Status", ""]}>
            {visible.length === 0 && <EmptyRow colSpan={6}>No products match these filters.</EmptyRow>}
            {visible.map((p) => {
              const stockTone: Tone = p.stock === 0 ? "bad" : p.stock <= p.reorderLevel ? "warn" : "good";
              const statusTone: Tone = p.status === "active" ? "good" : p.status === "draft" ? "neutral" : "bad";
              return (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Thumb src={p.images[0]?.url} alt={p.name} icon={ImageIcon} size="h-11 w-11" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {p.name}
                          {p.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {p.sku}
                          {brandName(p.brandId) ? ` · ${brandName(p.brandId)}` : ""}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">{categoryName(p.categoryId)}</Td>
                  <Td className="tabular-nums">
                    <span className="font-medium">{formatPrice(p.priceMinor, p.currency)}</span>
                    {p.compareAtMinor && <span className="block text-xs text-muted-foreground line-through">{formatPrice(p.compareAtMinor, p.currency)}</span>}
                  </Td>
                  <Td>
                    <Pill tone={stockTone}>{p.stock === 0 ? "Out" : `${p.stock} units`}</Pill>
                  </Td>
                  <Td>
                    <Pill tone={statusTone}>{p.status}</Pill>
                  </Td>
                  <Td className="w-20">
                    <RowActions name={p.name} onEdit={() => setSheet({ mode: "edit", id: p.id })} onDelete={() => setPending(p)} />
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Panel>

      <Sheet
        open={sheet !== null && (sheet.mode === "new" || !!editing)}
        title={sheet?.mode === "edit" ? `Edit ${editing?.name ?? "product"}` : "New product"}
        description="Fields marked with an error must be fixed before saving."
        onClose={() => setSheet(null)}
        width="max-w-3xl"
      >
        {sheet !== null && (
          <ProductForm
            key={sheet.mode === "edit" ? sheet.id : "new"}
            existing={editing}
            data={data}
            storeName={data.storeName}
            onSave={save}
            onCancel={() => setSheet(null)}
          />
        )}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.name ?? "product"}?`}
        body="The product is removed from the catalogue and storefront. Past orders keep their item records."
        confirmLabel="Delete product"
        onConfirm={() => pending && remove(pending)}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

/* ============================ Categories ============================ */

type CategoryValues = SeoValues & {
  name: string;
  slug: string;
  description: string;
  status: "active" | "hidden";
  sortOrder: string;
  image: MediaImage | null;
};

function CategoryForm({
  existing,
  data,
  storeName,
  onSave,
  onCancel
}: {
  existing?: DemoCategory;
  data: DemoDataset;
  storeName: string;
  onSave: (category: DemoCategory) => void;
  onCancel: () => void;
}) {
  const initial: CategoryValues = {
    name: existing?.name ?? "",
    slug: existing?.slug ?? "",
    description: existing?.description ?? "",
    status: existing?.status ?? "active",
    sortOrder: String(existing?.sortOrder ?? data.categories.length + 1),
    image: existing?.image ?? null,
    ...(existing ? seoToValues(existing.seo) : { metaTitle: "", metaDescription: "", keywords: "", noindex: false })
  };
  const form = useEntityForm(initial, categorySchema);
  const { values, errors, set, patch, fail } = form;
  const slugTouched = useRef(Boolean(existing));

  const submit = form.submit((v) => {
    if (data.categories.some((c) => c.slug === v.slug && c.id !== existing?.id)) return fail("slug", "Another category already uses this slug.");
    onSave({
      id: existing?.id ?? newId("cat"),
      name: v.name.trim(),
      slug: v.slug,
      description: v.description.trim(),
      image: v.image,
      seo: valuesToSeo(v),
      status: v.status,
      sortOrder: toInt(v.sortOrder)
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-10 px-6 py-6">
        <FormSection title="Category details">
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <Field label="Category name" error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => patch({ name: e.target.value, ...(slugTouched.current ? {} : { slug: slugify(e.target.value) }) })}
                className={INPUT}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input
                value={values.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set("slug", slugify(e.target.value));
                }}
                className={INPUT}
                aria-invalid={!!errors.slug}
              />
            </Field>
          </div>
          <Field label="Description" error={errors.description}>
            <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={3} className={TEXTAREA} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field control>
              <Select<"active" | "hidden"> label="Visibility" value={values.status} options={VISIBILITY_OPTIONS.map((o) => ({ value: o.value, label: o.label, description: o.description }))} onChange={(v) => set("status", v)} />
            </Field>
            <Field label="Sort order" error={errors.sortOrder} hint="Lower shows first">
              <input inputMode="numeric" value={values.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.sortOrder} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Category image" description="Used on the category tile and the category page header.">
          <ImageUploader label="Category image" value={values.image} onChange={(image) => set("image", image)} aspect="aspect-[4/3]" hint="Landscape works best, 1600 × 1000 px" />
        </FormSection>

        <FormSection title="Search engine optimisation">
          <SeoFields values={values} onChange={patch} name={values.name} slug={values.slug} path="category" storeName={storeName} errors={errors} />
        </FormSection>
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" className={BUTTON.primary}>{existing ? "Save changes" : "Create category"}</button>
      </SheetFooter>
    </form>
  );
}

export function CategoriesPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [sheet, setSheet] = useState<SheetState>(null);
  const [pending, setPending] = useState<DemoCategory | null>(null);
  const editing = sheet?.mode === "edit" ? data.categories.find((c) => c.id === sheet.id) : undefined;
  const countFor = (id: string) => data.products.filter((p) => p.categoryId === id).length;

  function save(category: DemoCategory) {
    update((d) => ({
      ...d,
      categories: d.categories.some((c) => c.id === category.id)
        ? d.categories.map((c) => (c.id === category.id ? category : c))
        : [...d.categories, category]
    }));
    setSheet(null);
  }

  const blocked = pending && countFor(pending.id) > 0 ? `${countFor(pending.id)} products are in this category. Move them to another category first.` : undefined;

  return (
    <Panel
      title="Categories"
      description="Group products for navigation, category pages and filters."
      action={
        <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New category
        </button>
      }
    >
      {data.categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" body="Create categories to help shoppers find products." />
      ) : (
        <Table head={["Category", "Products", "Visibility", ""]}>
          {data.categories.map((c) => (
            <Tr key={c.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Thumb src={c.image?.url} alt={c.name} icon={FolderTree} size="h-11 w-16" />
                  <div className="min-w-0">
                    <p className="font-medium">{c.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                </div>
              </Td>
              <Td className="tabular-nums">{countFor(c.id)}</Td>
              <Td>
                <Pill tone={c.status === "active" ? "good" : "neutral"}>{c.status === "active" ? "Visible" : "Hidden"}</Pill>
              </Td>
              <Td className="w-20">
                <RowActions name={c.name} onEdit={() => setSheet({ mode: "edit", id: c.id })} onDelete={() => setPending(c)} />
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Sheet
        open={sheet !== null && (sheet.mode === "new" || !!editing)}
        title={sheet?.mode === "edit" ? `Edit ${editing?.name ?? "category"}` : "New category"}
        onClose={() => setSheet(null)}
        width="max-w-2xl"
      >
        {sheet !== null && (
          <CategoryForm key={sheet.mode === "edit" ? sheet.id : "new"} existing={editing} data={data} storeName={data.storeName} onSave={save} onCancel={() => setSheet(null)} />
        )}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.name ?? "category"}?`}
        body="Shoppers will no longer see this category. Its products are not deleted."
        confirmLabel="Delete category"
        blockedReason={blocked}
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== pending.id) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </Panel>
  );
}

/* ============================ Brands ============================ */

type BrandValues = SeoValues & {
  name: string;
  slug: string;
  description: string;
  website: string;
  status: "active" | "hidden";
  logo: MediaImage | null;
};

function BrandForm({
  existing,
  data,
  storeName,
  onSave,
  onCancel
}: {
  existing?: DemoBrand;
  data: DemoDataset;
  storeName: string;
  onSave: (brand: DemoBrand) => void;
  onCancel: () => void;
}) {
  const initial: BrandValues = {
    name: existing?.name ?? "",
    slug: existing?.slug ?? "",
    description: existing?.description ?? "",
    website: existing?.website ?? "",
    status: existing?.status ?? "active",
    logo: existing?.logo ?? null,
    ...(existing ? seoToValues(existing.seo) : { metaTitle: "", metaDescription: "", keywords: "", noindex: false })
  };
  const form = useEntityForm(initial, brandSchema);
  const { values, errors, set, patch, fail } = form;
  const slugTouched = useRef(Boolean(existing));

  const submit = form.submit((v) => {
    if (data.brands.some((b) => b.slug === v.slug && b.id !== existing?.id)) return fail("slug", "Another brand already uses this slug.");
    onSave({
      id: existing?.id ?? newId("brand"),
      name: v.name.trim(),
      slug: v.slug,
      description: v.description.trim(),
      website: v.website.trim(),
      logo: v.logo,
      seo: valuesToSeo(v),
      status: v.status
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-10 px-6 py-6">
        <FormSection title="Brand details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name" error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => patch({ name: e.target.value, ...(slugTouched.current ? {} : { slug: slugify(e.target.value) }) })}
                className={INPUT}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Slug" error={errors.slug}>
              <input
                value={values.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set("slug", slugify(e.target.value));
                }}
                className={INPUT}
                aria-invalid={!!errors.slug}
              />
            </Field>
            <Field label="Website" error={errors.website} hint="Optional">
              <input value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" className={INPUT} aria-invalid={!!errors.website} />
            </Field>
            <Field control>
              <Select<"active" | "hidden"> label="Visibility" value={values.status} options={VISIBILITY_OPTIONS.map((o) => ({ value: o.value, label: o.label, description: o.description }))} onChange={(v) => set("status", v)} />
            </Field>
          </div>
          <Field label="About the brand" error={errors.description}>
            <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={3} className={TEXTAREA} />
          </Field>
        </FormSection>

        <FormSection title="Logo" description="Shown on brand pages and product cards.">
          <ImageUploader label="Brand logo" value={values.logo} onChange={(logo) => set("logo", logo)} aspect="aspect-[3/2]" hint="Transparent PNG works best" />
        </FormSection>

        <FormSection title="Search engine optimisation">
          <SeoFields values={values} onChange={patch} name={values.name} slug={values.slug} path="brands" storeName={storeName} errors={errors} />
        </FormSection>
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" className={BUTTON.primary}>{existing ? "Save changes" : "Create brand"}</button>
      </SheetFooter>
    </form>
  );
}

export function BrandsPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [sheet, setSheet] = useState<SheetState>(null);
  const [pending, setPending] = useState<DemoBrand | null>(null);
  const editing = sheet?.mode === "edit" ? data.brands.find((b) => b.id === sheet.id) : undefined;
  const countFor = (id: string) => data.products.filter((p) => p.brandId === id).length;

  function save(brand: DemoBrand) {
    update((d) => ({
      ...d,
      brands: d.brands.some((b) => b.id === brand.id) ? d.brands.map((b) => (b.id === brand.id ? brand : b)) : [...d.brands, brand]
    }));
    setSheet(null);
  }

  return (
    <Panel
      title="Brands"
      description="Brand pages, logos and brand filters on the storefront."
      action={
        <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New brand
        </button>
      }
    >
      {data.brands.length === 0 ? (
        <EmptyState icon={Tag} title="No brands yet" body="Add brands to create brand pages and filters." />
      ) : (
        <Table head={["Brand", "Products", "Visibility", ""]}>
          {data.brands.map((b) => (
            <Tr key={b.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Thumb src={b.logo?.url} alt={b.name} icon={Tag} size="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="font-medium">{b.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.website || "No website"}</p>
                  </div>
                </div>
              </Td>
              <Td className="tabular-nums">{countFor(b.id)}</Td>
              <Td>
                <Pill tone={b.status === "active" ? "good" : "neutral"}>{b.status === "active" ? "Visible" : "Hidden"}</Pill>
              </Td>
              <Td className="w-20">
                <RowActions name={b.name} onEdit={() => setSheet({ mode: "edit", id: b.id })} onDelete={() => setPending(b)} />
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Sheet
        open={sheet !== null && (sheet.mode === "new" || !!editing)}
        title={sheet?.mode === "edit" ? `Edit ${editing?.name ?? "brand"}` : "New brand"}
        onClose={() => setSheet(null)}
        width="max-w-2xl"
      >
        {sheet !== null && (
          <BrandForm key={sheet.mode === "edit" ? sheet.id : "new"} existing={editing} data={data} storeName={data.storeName} onSave={save} onCancel={() => setSheet(null)} />
        )}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.name ?? "brand"}?`}
        body={`The brand page is removed. ${pending ? countFor(pending.id) : 0} products keep their other details and lose this brand.`}
        confirmLabel="Delete brand"
        onConfirm={() => {
          if (pending) {
            update((d) => ({
              ...d,
              brands: d.brands.filter((b) => b.id !== pending.id),
              products: d.products.map((p) => (p.brandId === pending.id ? { ...p, brandId: null } : p))
            }));
          }
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </Panel>
  );
}

/* ============================ Inventory ============================ */

export function InventoryPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const units = data.products.reduce((sum, p) => sum + p.stock, 0);
  const value = data.products.reduce((sum, p) => sum + p.stock * p.costMinor, 0);
  const out = data.products.filter((p) => p.stock === 0).length;
  const low = data.products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const categoryName = (id: string | null) => data.categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  function adjust(id: string, delta: number) {
    update((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)) }));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Units on hand" value={String(units)} icon={Boxes} />
        <StatCard label="Stock at cost" value={formatPrice(value, data.settings.currency)} hint="Quantity × cost price" icon={Warehouse} />
        <StatCard label="Low stock" value={String(low)} hint="At or below reorder level" icon={Warehouse} />
        <StatCard label="Out of stock" value={String(out)} icon={Warehouse} />
      </div>
      <Panel title="Stock levels" description="Adjust quantities as stock arrives or sells. Use the product editor for cost and reorder levels.">
        <Table head={["Product", "Category", "On hand", "Reorder at", "Status", "Adjust"]}>
          {data.products.map((p) => {
            const tone: Tone = p.stock === 0 ? "bad" : p.stock <= p.reorderLevel ? "warn" : "good";
            const label = p.stock === 0 ? "Out" : p.stock <= p.reorderLevel ? "Reorder" : "In stock";
            return (
              <Tr key={p.id}>
                <Td className="min-w-[12rem]">
                  <p className="font-medium">{p.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                </Td>
                <Td className="text-muted-foreground">{categoryName(p.categoryId)}</Td>
                <Td className="tabular-nums font-semibold">{p.stock}</Td>
                <Td className="tabular-nums text-muted-foreground">{p.reorderLevel}</Td>
                <Td>
                  <Pill tone={tone}>{label}</Pill>
                </Td>
                <Td>
                  <div className="inline-flex items-center gap-1.5">
                    <button type="button" onClick={() => adjust(p.id, -1)} disabled={p.stock === 0} aria-label={`Remove one ${p.name}`} className="h-8 w-8 rounded-lg border border-border text-sm transition-colors hover:bg-accent disabled:opacity-40">−</button>
                    <button type="button" onClick={() => adjust(p.id, 1)} aria-label={`Add one ${p.name}`} className="h-8 w-8 rounded-lg border border-border text-sm transition-colors hover:bg-accent">+</button>
                    <button type="button" onClick={() => adjust(p.id, 10)} aria-label={`Add ten ${p.name}`} className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors hover:bg-accent">+10</button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}

/* ============================ Reviews ============================ */

export function ReviewsPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [pending, setPending] = useState<string | null>(null);
  const productName = (id: string) => data.products.find((p) => p.id === id)?.name ?? "Deleted product";
  const waiting = data.reviews.filter((r) => !r.approved).length;
  const average = data.reviews.length ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1) : "–";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        <StatCard label="Average rating" value={average} icon={Star} />
        <StatCard label="Awaiting approval" value={String(waiting)} hint="Hidden from shoppers" icon={MessageSquareText} />
        <StatCard label="Total reviews" value={String(data.reviews.length)} icon={MessageSquareText} />
      </div>
      <Panel title="Reviews" description="Approve reviews before they appear on product pages.">
        {data.reviews.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="Nothing to moderate" body="New reviews wait here for approval." />
        ) : (
          <Table head={["Product", "Rating", "Review", "Status", ""]}>
            {data.reviews.map((r) => (
              <Tr key={r.id}>
                <Td className="min-w-[12rem]">
                  <p className="font-medium">{productName(r.productId)}</p>
                  <p className="text-xs text-muted-foreground">{r.author} · {r.createdAt}</p>
                </Td>
                <Td>
                  <span className="text-amber-500" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</span>
                  <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
                </Td>
                <Td className="min-w-[14rem] text-muted-foreground">{r.comment}</Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => update((d) => ({ ...d, reviews: d.reviews.map((x) => (x.id === r.id ? { ...x, approved: !x.approved } : x)) }))}
                    aria-label={`${r.approved ? "Hide" : "Approve"} review by ${r.author}`}
                    className="transition-opacity hover:opacity-80"
                  >
                    <Pill tone={r.approved ? "good" : "warn"}>{r.approved ? "Approved" : "Pending"}</Pill>
                  </button>
                </Td>
                <Td className="w-20">
                  <RowActions name={`review by ${r.author}`} onEdit={() => update((d) => ({ ...d, reviews: d.reviews.map((x) => (x.id === r.id ? { ...x, approved: !x.approved } : x)) }))} onDelete={() => setPending(r.id)} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>
      <ConfirmDialog
        open={pending !== null}
        title="Delete this review?"
        body="The review is removed permanently. The product rating is recalculated."
        confirmLabel="Delete review"
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, reviews: d.reviews.filter((r) => r.id !== pending) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

export function CatalogPanel({ feature, data, update }: { feature: "products" | "categories" | "brands" | "inventory" | "reviews"; data: DemoDataset; update: DemoUpdate }) {
  switch (feature) {
    case "products":
      return <ProductsPanel data={data} update={update} />;
    case "categories":
      return <CategoriesPanel data={data} update={update} />;
    case "brands":
      return <BrandsPanel data={data} update={update} />;
    case "inventory":
      return <InventoryPanel data={data} update={update} />;
    case "reviews":
      return <ReviewsPanel data={data} update={update} />;
  }
}

