import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

const base =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[16px] text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50";

function Label({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Field({
  label, hint, ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <Label label={label} hint={hint}><input {...props} className={`h-14 ${base}`} /></Label>;
}

export function TextArea({
  label, hint, ...props
}: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Label label={label} hint={hint}><textarea {...props} className={`min-h-28 py-3.5 ${base}`} /></Label>;
}

export function Select({
  label, hint, children, ...props
}: { label: string; hint?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Label label={label} hint={hint}>
      <select {...props} className={`h-14 appearance-none ${base}`}>{children}</select>
    </Label>
  );
}