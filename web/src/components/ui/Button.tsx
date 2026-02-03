import React from "react";
import { cx } from "./cx";

type ButtonVariant = "primary" | "secondary" | "danger" | "dangerSecondary";
type ButtonSize = "md" | "sm";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none rounded-full font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--pf-interactive-primary-bg)] text-[color:var(--pf-interactive-primary-label)] hover:bg-[color:var(--pf-interactive-primary-bg-hover)] active:bg-[color:var(--pf-interactive-primary-bg-press)]",
  secondary:
    "border border-[color:var(--pf-interactive-secondary-border)] bg-[color:var(--pf-interactive-secondary-bg)] text-[color:var(--pf-interactive-secondary-label)] hover:border-[color:var(--pf-interactive-secondary-border-hover)] hover:bg-[color:var(--pf-interactive-secondary-bg-hover)] hover:text-[color:var(--pf-interactive-secondary-label-hover)] active:border-[color:var(--pf-interactive-secondary-border-press)] active:bg-[color:var(--pf-interactive-secondary-bg-press)] active:text-[color:var(--pf-interactive-secondary-label-press)]",
  danger:
    "bg-[color:var(--pf-interactive-danger-bg)] text-[color:var(--pf-interactive-danger-label)] hover:bg-[color:var(--pf-interactive-danger-bg-hover)] active:bg-[color:var(--pf-interactive-danger-bg-press)]",
  dangerSecondary:
    "border border-[color:var(--pf-interactive-danger-secondary-border)] bg-[color:var(--pf-interactive-secondary-bg)] text-[color:var(--pf-interactive-danger-secondary-label)] hover:bg-red-500/5 active:bg-red-500/10",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm leading-5",
  sm: "px-3 py-1.5 text-xs leading-5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cx(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
