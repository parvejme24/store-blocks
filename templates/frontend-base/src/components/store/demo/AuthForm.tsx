"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { useStoreBasePath } from "../StoreProviders";

const FIELD =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms to continue." }) })
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

/**
 * Sign-in and registration forms for a theme site. Demo only: nothing is sent to a
 * server, and passwords are never stored or logged.
 */
export function AuthForm({ mode, storeName }: { mode: "login" | "register"; storeName: string }) {
  const basePath = useStoreBasePath();
  const [done, setDone] = useState<string | null>(null);
  const isLogin = mode === "login";

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const register = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", terms: undefined as unknown as true }
  });

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{done}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Demo mode: no real account was created or signed in.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={`${basePath}/products`} className="btn-brand justify-center">Start shopping</Link>
          <Link href={`${basePath}/admin`} className="btn-ghost justify-center">Open admin demo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 sm:p-10">
      <p className="text-sm font-medium text-primary">{storeName}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{isLogin ? "Sign in to your account" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isLogin ? "Track orders, save favourites and check out faster." : "Save your details for faster checkout and order tracking."}
      </p>

      {isLogin ? (
        <form
          noValidate
          onSubmit={login.handleSubmit(() => setDone("Welcome back!"))}
          className="mt-8 space-y-5"
        >
          <Field label="Email" error={login.formState.errors.email?.message}>
            <input {...login.register("email")} type="email" autoComplete="email" className={FIELD} aria-invalid={!!login.formState.errors.email} />
          </Field>
          <Field label="Password" error={login.formState.errors.password?.message}>
            <input {...login.register("password")} type="password" autoComplete="current-password" className={FIELD} aria-invalid={!!login.formState.errors.password} />
          </Field>
          <button type="submit" disabled={login.formState.isSubmitting} className="btn-brand w-full justify-center disabled:opacity-60">
            Sign in
          </button>
        </form>
      ) : (
        <form
          noValidate
          onSubmit={register.handleSubmit(() => setDone("Account created!"))}
          className="mt-8 space-y-5"
        >
          <Field label="Full name" error={register.formState.errors.fullName?.message}>
            <input {...register.register("fullName")} autoComplete="name" className={FIELD} aria-invalid={!!register.formState.errors.fullName} />
          </Field>
          <Field label="Email" error={register.formState.errors.email?.message}>
            <input {...register.register("email")} type="email" autoComplete="email" className={FIELD} aria-invalid={!!register.formState.errors.email} />
          </Field>
          <Field label="Password" error={register.formState.errors.password?.message}>
            <input {...register.register("password")} type="password" autoComplete="new-password" className={FIELD} aria-invalid={!!register.formState.errors.password} />
          </Field>
          <Field label="Confirm password" error={register.formState.errors.confirmPassword?.message}>
            <input {...register.register("confirmPassword")} type="password" autoComplete="new-password" className={FIELD} aria-invalid={!!register.formState.errors.confirmPassword} />
          </Field>
          <div>
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" {...register.register("terms")} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
              <span>I agree to the terms and privacy policy.</span>
            </label>
            {register.formState.errors.terms && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{register.formState.errors.terms.message}</p>
            )}
          </div>
          <button type="submit" disabled={register.formState.isSubmitting} className="btn-brand w-full justify-center disabled:opacity-60">
            Create account
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={`${basePath}/${isLogin ? "register" : "login"}`} className="font-medium text-foreground underline underline-offset-4">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span role="alert" className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
