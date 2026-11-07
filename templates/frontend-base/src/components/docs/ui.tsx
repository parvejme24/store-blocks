import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Hash, Info } from "lucide-react";

type PageHeaderProps = {
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/** Top-of-page heading block used by every documentation page. */
export function PageHeader({ eyebrow, icon: Icon, title, description, children }: PageHeaderProps) {
  return (
    <header className="space-y-5 border-b pb-10">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{eyebrow}</span>
        </div>
      )}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      )}
      {children}
    </header>
  );
}

type DocSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** A titled section with a stable anchor and a hover-revealed link icon. */
export function DocSection({ id, title, description, children }: DocSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div className="group space-y-1.5">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span>{title}</span>
          {id && (
            <a
              href={`#${id}`}
              aria-label={`Link to ${title}`}
              className="text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Hash className="h-4 w-4" />
            </a>
          )}
        </h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const TONES = {
  info: {
    icon: Info,
    box: "border-sky-500/30 bg-sky-500/5",
    iconClass: "text-sky-600 dark:text-sky-400"
  },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-500/30 bg-amber-500/5",
    iconClass: "text-amber-600 dark:text-amber-400"
  },
  success: {
    icon: CheckCircle2,
    box: "border-emerald-500/30 bg-emerald-500/5",
    iconClass: "text-emerald-600 dark:text-emerald-400"
  }
} as const;

/** Highlighted note used for tips, warnings and confirmations. */
export function Callout({
  tone = "info",
  title,
  children
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, box, iconClass } = TONES[tone];
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${box}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-semibold text-foreground">{title}</p>}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

/** Responsive card grid for feature or option tiles. */
export function CardGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`grid gap-4 ${cols}`}>{children}</div>;
}
