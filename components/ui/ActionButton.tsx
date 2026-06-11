import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ActionButtonSize = "sm" | "md" | "lg";

type ActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  className?: string;
  href?: string;
  external?: boolean;
  loading?: boolean;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
};

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: "border-slate-950 bg-slate-950 text-white hover:bg-sky-950",
  secondary: "border-slate-200 bg-white text-slate-800 hover:border-sky-200 hover:text-sky-800",
  ghost: "border-slate-200/80 bg-transparent text-slate-600 hover:bg-white hover:text-slate-950",
  danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
};

const sizeClasses: Record<ActionButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-sm"
};

function classes(variant: ActionButtonVariant, size: ActionButtonSize, className: string) {
  return [
    "inline-flex max-w-full items-center justify-center gap-2 rounded-full border font-black leading-none shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-55",
    "active:translate-y-px",
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(" ");
}

export function ActionButton({
  children,
  className = "",
  href,
  external = false,
  loading = false,
  disabled,
  variant = "primary",
  size = "md",
  type = "button",
  ...buttonProps
}: ActionButtonProps) {
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
      <span className="inline-flex min-w-0 flex-wrap items-center justify-center gap-2 text-center leading-tight">{children}</span>
    </>
  );

  if (href) {
    const linkClassName = `${classes(variant, size, className)} ${disabled || loading ? "pointer-events-none opacity-55" : ""}`;

    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" aria-disabled={disabled || loading} className={linkClassName}>
          {content}
        </a>
      );
    }

    return (
      <Link href={href} aria-disabled={disabled || loading} className={linkClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes(variant, size, className)} {...buttonProps}>
      {content}
    </button>
  );
}
