"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CommandPillProps = {
  /** A single shell command, for example "npx create-storeblocks my-shop". */
  command: string;
  className?: string;
};

/**
 * One-line command with a copy button, styled like the install bar on nextjs.org.
 * Long commands wrap on phones and truncate on wider screens; the full text is in the title.
 */
export function CommandPill({ command, className = "" }: CommandPillProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`flex w-full min-w-0 max-w-full items-center gap-3 rounded-full border border-border bg-card/70 py-1.5 pl-4 pr-1.5 font-mono text-xs shadow-sm backdrop-blur sm:text-sm ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 select-none text-primary">$</span>
      <code className="min-w-0 flex-1 break-all text-left text-foreground sm:truncate sm:break-normal" title={command}>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Command copied" : `Copy command: ${command}`}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
