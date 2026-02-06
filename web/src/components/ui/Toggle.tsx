import React from "react";
import { cx } from "./cx";

type ToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Toggle({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...aria
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx(
        "pf-focusable relative h-5 w-8 rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-[color:var(--pf-toggle-bg-on)]" : "bg-[color:var(--pf-toggle-bg-off)]",
        className
      )}
      onClick={() => onCheckedChange(!checked)}
      {...aria}
    >
      <span
        className={cx(
          "absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-[color:var(--pf-toggle-handle)] transition-transform",
          checked ? "translate-x-[12px]" : "translate-x-0"
        )}
      />
    </button>
  );
}
