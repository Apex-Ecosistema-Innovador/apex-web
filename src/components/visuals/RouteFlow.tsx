"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface RouteFlowStep {
  id: string;
  content: ReactNode;
  /** Tono del conector que entra a este paso desde el anterior (se ignora en el primer paso). */
  connectorTone?: "muted" | "vivid";
}

interface RouteFlowProps {
  steps: RouteFlowStep[];
  className?: string;
}

function Connector({
  tone,
  orientation,
  transitionClass,
}: {
  tone: "muted" | "vivid";
  orientation: "horizontal" | "vertical";
  transitionClass: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        orientation === "horizontal" ? "h-px w-8 lg:w-10" : "my-1 h-6 w-px",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          tone === "vivid" ? "bg-brand-green-light/50" : "bg-(--border-subtle)",
          transitionClass,
        )}
      />
      {/* Morado como acento pequeño en el conector — solo aparece con la ruta viva */}
      <span
        className={cn(
          "absolute size-1.5 rounded-full bg-brand-purple",
          tone === "vivid" ? "opacity-100" : "opacity-0",
          transitionClass,
        )}
      />
    </div>
  );
}

/**
 * Secuencia de pasos conectados: fila horizontal en desktop, columna
 * vertical en móvil. Cada paso conserva su propio ancho (lo define su
 * `content`) y la secuencia se alinea al inicio, nunca centrada — así,
 * añadir pasos al final nunca reubica los anteriores. Pensado para
 * reutilizarse en otros recorridos (LearningJourney, CompetitivePath), no
 * solo en el comparador de ParadigmShift.
 */
export function RouteFlow({ steps, className }: RouteFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const transitionClass = prefersReducedMotion
    ? ""
    : "transition-[background-color,opacity] duration-(--duration-base) ease-default";

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden flex-row flex-wrap items-center justify-start gap-y-6 md:flex">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {index > 0 ? (
              <Connector
                tone={step.connectorTone ?? "muted"}
                orientation="horizontal"
                transitionClass={transitionClass}
              />
            ) : null}
            {step.content}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-stretch md:hidden">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-stretch">
            {index > 0 ? (
              <div className="flex justify-center">
                <Connector
                  tone={step.connectorTone ?? "muted"}
                  orientation="vertical"
                  transitionClass={transitionClass}
                />
              </div>
            ) : null}
            {step.content}
          </div>
        ))}
      </div>
    </div>
  );
}
