import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-subtle bg-elevated px-2 py-1 font-mono text-xs text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
