import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ButtonBaseProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

type ButtonProps =
  | (ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

export function Button({ children, variant = "primary", className, ...props }: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium font-body transition-colors duration-(--duration-fast) ease-default",
    variant === "primary"
      ? "border-transparent bg-brand-green-light text-(--bg-base) hover:opacity-90"
      : "border-default bg-transparent text-primary hover:border-principal",
    className,
  );

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a href={href} className={styles} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
