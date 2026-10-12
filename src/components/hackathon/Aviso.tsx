import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AvisoProps {
  tono: "error" | "exito" | "info";
  children: ReactNode;
  className?: string;
}

const clases = {
  error: "border-danger text-danger",
  exito: "border-principal text-accent",
  info: "border-default text-secondary",
};

export function Aviso({ tono, children, className }: AvisoProps) {
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={cn("rounded-lg border bg-surface px-4 py-3 font-body text-sm", clases[tono], className)}
    >
      {children}
    </div>
  );
}
