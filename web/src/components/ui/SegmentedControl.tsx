import React from "react";
import { cx } from "./cx";

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlSize = "lg" | "sm";

type SegmentedControlProps<T extends string> = {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  className?: string;
  ariaLabel?: string;
};

const containerBase =
  "inline-flex items-center gap-0 overflow-hidden rounded-full bg-[color:var(--pf-segmented-bg)] p-1";

const itemBase =
  "pf-focusable rounded-full font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

const sizes: Record<SegmentedControlSize, { container: string; item: string }> = {
  lg: { container: "", item: "px-6 py-2 text-sm leading-5" },
  sm: { container: "", item: "px-4 py-1.5 text-xs leading-5" },
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx(containerBase, sizes[size].container, className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cx(
              itemBase,
              sizes[size].item,
              selected
                ? "bg-[color:var(--pf-surface)] text-[color:var(--pf-text)] shadow-[0px_9px_9px_0px_rgba(0,0,0,0.01),0px_2px_5px_0px_rgba(0,0,0,0.06)]"
                : "text-[color:var(--pf-text)] hover:bg-[color:var(--pf-interactive-secondary-bg-hover)] active:bg-[color:var(--pf-interactive-secondary-bg-press)]"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
