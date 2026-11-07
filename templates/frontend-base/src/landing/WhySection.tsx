"use client";

import { motion, type Variants } from "motion/react";
import { Boxes, Check, Database, Layers, Sparkles, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const WITHOUT = [
  { title: "Rebuilt for every client", body: "Accounts, carts, checkout and orders get written again for each project." },
  { title: "Locked into one stack", body: "Switching database or payment gateway means rewriting code across the app." },
  { title: "Bloated projects", body: "Unused modules and packages slow builds and widen the attack surface." },
  { title: "Weeks before the first sale", body: "Setup, authentication and checkout come before any product can be listed or sold." }
];

const WITH = [
  { icon: Boxes, title: "Only the code you choose", body: "Unselected modules are not generated, and their packages are not installed." },
  { icon: Database, title: "Swap the database and adapters", body: "MongoDB or PostgreSQL, Cloudinary, S3 or local storage, COD, SSLCommerz or Stripe." },
  { icon: Layers, title: "Configure, don't rewrite", body: "Settings live in .env and store.config.json. Themes change the look, not the logic." }
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

export function WhySection() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Why StoreBlocks
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Stop rebuilding the <span className="text-gradient">same store</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every client project repeats the same foundation. StoreBlocks turns that foundation into one command.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        {/* Without */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col rounded-3xl border border-border bg-card/40 p-6 sm:p-8"
        >
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            Without StoreBlocks
          </p>
          <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mt-6 space-y-5">
            {WITHOUT.map((entry) => (
              <motion.li key={entry.title} variants={item} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                  <X className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-foreground/90">{entry.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* With: gradient border panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative rounded-3xl bg-gradient-to-br from-violet-500/60 via-primary/20 to-fuchsia-500/50 p-px shadow-2xl shadow-primary/10"
        >
          <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-card p-6 sm:p-8">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              With StoreBlocks
            </p>
            <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mt-6 space-y-4">
              {WITH.map((entry) => {
                const Icon = entry.icon;
                return (
                  <motion.li
                    key={entry.title}
                    variants={item}
                    whileHover={{ y: -3 }}
                    className="group flex gap-4 rounded-2xl border border-border bg-background/50 p-4 transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 ring-1 ring-inset ring-primary/25 transition-transform group-hover:scale-105">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold">{entry.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
