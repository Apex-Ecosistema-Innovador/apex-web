"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RouteFlow, type RouteFlowStep } from "@/components/visuals/RouteFlow";

type Accent = "green" | "yellow";

/** Los primeros 4 pasos se transforman en el mismo lugar: mismo rol en la
 *  ruta, distinta palabra y color según el estado activo. */
const transformSteps: { id: string; conventional: string; designed: string; accent: Accent }[] = [
  { id: "step-1", conventional: "Escuchar", designed: "Comprender", accent: "green" },
  { id: "step-2", conventional: "Memorizar", designed: "Practicar", accent: "yellow" },
  { id: "step-3", conventional: "Codificar", designed: "Resolver", accent: "green" },
  { id: "step-4", conventional: "Evaluación", designed: "Colaborar", accent: "yellow" },
];

/** Los 2 pasos que solo existen en el modelo que se está diseñando —
 *  extienden la ruta en vez de reemplazarla. */
const extraSteps: { id: string; designed: string; accent: Accent }[] = [
  { id: "step-5", designed: "Competir", accent: "green" },
  { id: "step-6", designed: "Evolucionar", accent: "yellow" },
];

const accentClass: Record<Accent, string> = {
  green: "border-brand-green-light text-brand-green-light",
  yellow: "border-brand-yellow text-brand-yellow",
};

function TransformPill({
  conventionalLabel,
  designedLabel,
  isDesigned,
  accent,
  prefersReducedMotion,
}: {
  conventionalLabel: string;
  designedLabel: string;
  isDesigned: boolean;
  accent: Accent;
  prefersReducedMotion: boolean;
}) {
  const labelTransition = prefersReducedMotion
    ? ""
    : "transition-opacity duration-(--duration-base) ease-default";

  return (
    <div
      className={cn(
        "relative flex h-14 w-full items-center justify-center rounded-lg border bg-elevated px-3 text-center md:w-32 lg:w-36",
        "hover:-translate-y-0.5",
        prefersReducedMotion ? "" : "transition-[transform,background-color,border-color,color] duration-(--duration-base) ease-default",
        isDesigned ? accentClass[accent] : "border-subtle text-secondary",
      )}
    >
      <span
        className={cn(
          "absolute px-2 font-body text-sm font-medium",
          labelTransition,
          isDesigned ? "opacity-0" : "opacity-100",
        )}
      >
        {conventionalLabel}
      </span>
      <span
        className={cn(
          "absolute px-2 font-body text-sm font-medium",
          labelTransition,
          isDesigned ? "opacity-100" : "opacity-0",
        )}
      >
        {designedLabel}
      </span>
    </div>
  );
}

function ExtraPill({
  label,
  accent,
  prefersReducedMotion,
}: {
  label: string;
  accent: Accent;
  prefersReducedMotion: boolean;
}) {
  // Recién montado (solo existe cuando isDesigned es true): entra con
  // fade + leve translate en vez de aparecer de golpe.
  const [entered, setEntered] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn(
        "flex h-14 w-full items-center justify-center rounded-lg border bg-elevated px-3 text-center font-body text-sm font-medium md:w-32 lg:w-36",
        "hover:-translate-y-0.5",
        prefersReducedMotion
          ? ""
          : "transition-[transform,opacity] duration-(--duration-base) ease-default",
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        accentClass[accent],
      )}
    >
      {label}
    </div>
  );
}

export function ParadigmShift() {
  const [isDesigned, setIsDesigned] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const toggleTransition = prefersReducedMotion
    ? ""
    : "transition-transform duration-(--duration-base) ease-default";
  const labelColorTransition = prefersReducedMotion
    ? ""
    : "transition-colors duration-(--duration-fast) ease-default";
  const glowTransition = prefersReducedMotion
    ? ""
    : "transition-opacity duration-(--duration-fast) ease-default";
  const ambientTransition = prefersReducedMotion
    ? ""
    : "transition-opacity duration-(--duration-slow) ease-default";

  const steps: RouteFlowStep[] = [
    ...transformSteps.map((step) => ({
      id: step.id,
      connectorTone: (isDesigned ? "vivid" : "muted") as "muted" | "vivid",
      content: (
        <TransformPill
          conventionalLabel={step.conventional}
          designedLabel={step.designed}
          isDesigned={isDesigned}
          accent={step.accent}
          prefersReducedMotion={prefersReducedMotion}
        />
      ),
    })),
    ...(isDesigned
      ? extraSteps.map((step) => ({
          id: step.id,
          connectorTone: "vivid" as const,
          content: (
            <ExtraPill
              label={step.designed}
              accent={step.accent}
              prefersReducedMotion={prefersReducedMotion}
            />
          ),
        }))
      : []),
  ];

  return (
    <section
      id="cambio-de-paradigma"
      className="relative overflow-hidden bg-canvas py-20 md:py-32"
    >
      {/* Atmósfera de fondo — se enciende solo cuando el modelo nuevo está
          activo. Un único elemento que cruza opacidad (nunca background-size
          ni posición), difuso por el propio falloff del radial-gradient para
          no pagar el costo de un filter: blur sobre toda la sección. */}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0", ambientTransition)}
        style={{
          opacity: isDesigned ? 1 : 0,
          background:
            "radial-gradient(60% 55% at 12% 8%, color-mix(in oklch, var(--brand-green-pine) 38% , transparent) 0%, transparent 70%), " +
            "radial-gradient(55% 50% at 88% 18%, color-mix(in oklch, var(--brand-yellow) 20%, transparent) 0%, transparent 70%), " +
            "radial-gradient(55% 60% at 50% 105%, color-mix(in oklch, var(--brand-purple) 20%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Cambio de paradigma"
            title="La misma ruta, reimaginada."
            description="No reemplazamos la experiencia desde cero: la transformamos. Activa el interruptor y observa cómo cambia la ruta."
          />
        </Reveal>

        <Reveal delay={80}>
          <button
            type="button"
            aria-pressed={isDesigned}
            aria-label={
              isDesigned
                ? "Mostrar el modelo convencional"
                : "Mostrar el modelo que se está diseñando"
            }
            onClick={() => setIsDesigned((value) => !value)}
            className="relative mb-10 flex w-full overflow-hidden rounded-lg border border-default bg-elevated p-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto md:mb-16"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-1 w-1/2 rounded-lg",
                toggleTransition,
                isDesigned ? "translate-x-full" : "translate-x-0",
              )}
            >
              {/* Base neutra — siempre presente, el estado "apagado" por defecto. */}
              <span className="absolute inset-0 rounded-lg bg-canvas" />
              {/* Capa de encendido — solo cruza opacidad, nunca color/box-shadow
                  directamente, para quedarnos dentro de transform+opacity. */}
              <span
                aria-hidden="true"
                className={cn("absolute -inset-px rounded-lg border", glowTransition)}
                style={{
                  opacity: isDesigned ? 1 : 0,
                  borderColor: "color-mix(in oklch, var(--brand-green-light) 65%, transparent)",
                  boxShadow:
                    "0 0 16px 1px color-mix(in oklch, var(--brand-green-light) 45%, transparent), inset 0 0 12px 0 color-mix(in oklch, var(--brand-green-light) 16%, transparent)",
                }}
              />
            </span>
            <span
              className={cn(
                "relative z-10 flex min-h-11 flex-1 items-center justify-center px-4 py-2 text-center font-mono text-[11px] uppercase tracking-wide sm:text-xs",
                !isDesigned ? "text-primary" : "text-muted",
                labelColorTransition,
              )}
            >
              Modelo convencional
            </span>
            <span
              className={cn(
                "relative z-10 flex min-h-11 flex-1 items-center justify-center px-4 py-2 text-center font-mono text-[11px] uppercase tracking-wide sm:text-xs",
                isDesigned ? "text-brand-green-light" : "text-muted",
                labelColorTransition,
              )}
            >
              Modelo que se está diseñando
            </span>
          </button>
        </Reveal>

        <Reveal delay={160}>
          <RouteFlow steps={steps} />
        </Reveal>
      </Container>
      </div>
    </section>
  );
}
