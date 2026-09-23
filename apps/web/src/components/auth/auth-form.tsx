"use client";

import { useActionState, useState, type InputHTMLAttributes } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { login, signup, type AuthState } from "@/app/(auth)/actions";
import { easePremium } from "@/lib/motion";

type Mode = "login" | "signup";
type Role = "student" | "lister";
const initialState: AuthState = {};

export function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState(isSignup ? signup : login, initialState);
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="pt-10 lg:pt-0"
    >
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-ink">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {isSignup ? "Save places you like and leave reviews." : "Log in to pick up where you left off."}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        {isSignup && (
          <>
            <input type="hidden" name="role" value={role} />
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
              {(["student", "lister"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`relative z-0 rounded-xl py-3 text-[15px] font-semibold transition-colors ${
                    role === r ? "text-brand-ink" : "text-muted"
                  }`}
                >
                  {role === r && (
                    <motion.span
                      layoutId="role-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {r === "student" ? "I'm a student" : "I'm a lister"}
                </button>
              ))}
            </div>
            <Field label="Full name" name="display_name" type="text" autoComplete="name" placeholder="Jane Doe" />
          </>
        )}

        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />

        <Field
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          minLength={8}
          placeholder={isSignup ? "At least 8 characters" : "••••••••"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          action={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <AnimatePresence>
          {state.error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              {state.error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={pending}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15, ease: easePremium }}
          className="h-14 w-full rounded-2xl bg-brand-ink text-[15px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(11,59,94,0.6)] transition hover:brightness-110 active:brightness-95 disabled:opacity-60"
        >
          {pending ? "One moment…" : isSignup ? "Create account" : "Log in"}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-[15px] text-muted">
        {isSignup ? "Already have an account? " : "New to OffKamp? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-ink underline decoration-brand-deep decoration-2 underline-offset-4"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </motion.div>
  );
}

function Field({
  label,
  action,
  ...props
}: { label: string; action?: React.ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <span className="relative block">
        <input
          {...props}
          required
          className="h-14 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50"
        />
        {action}
      </span>
    </label>
  );
}