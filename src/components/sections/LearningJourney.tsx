"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { journey } from "@/content/journey";

/** Color de un paso según su posición (0..1) en el recorrido, interpolando
 *  morado → verde claro → amarillo. Así el trazado se lee como un único
 *  degradado continuo sin tener que codificar un color por paso. */
function gradientColorAt(position: number) {
  if (position <= 0.5) {
    const t = position / 0.5;
    return `color-mix(in oklab, var(--brand-purple), var(--brand-green-light) ${t * 100}%)`;
  }
  const t = (position - 0.5) / 0.5;
  return `color-mix(in oklab, var(--brand-green-light), var(--brand-yellow) ${t * 100}%)`;
}

/**
 * Revela cada paso permanentemente (una sola vez) cuando su nodo entra en
 * el viewport, con UN ÚNICO IntersectionObserver compartido entre los N
 * pasos — mismo patrón que hooks/useInView.ts (threshold + unobserve tras
 * disparar), adaptado a una lista en vez de un solo elemento, para no crear
 * N observers ni recalcular nada en cada evento de scroll.
 */
function useStaggeredReveal(count: number, disabled: boolean) {
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(count).fill(false));
  const nodesRef = useRef<(HTMLElement | null)[]>(Array(count).fill(null));

  useEffect(() => {
    // `disabled` (prefers-reduced-motion) puede llegar a `true` un tick
    // después del primer render — si eso pasa, hay que marcar todo como
    // revelado explícitamente, no solo saltarnos crear el observer.
    if (disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          let changed = false;
          const next = [...prev];
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = Number((entry.target as HTMLElement).dataset.stepIndex);
            if (!next[index]) {
              next[index] = true;
              changed = true;
            }
            observer.unobserve(entry.target);
          }
          return changed ? next : prev;
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px -15% 0px" },
    );

    nodesRef.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [disabled, count]);

  function setNodeRef(index: number) {
    return (node: HTMLElement | null) => {
      nodesRef.current[index] = node;
    };
  }

  return { revealed: disabled ? Array(count).fill(true) : revealed, setNodeRef };
}

function Segment({
  active,
  colorFrom,
  colorTo,
  prefersReducedMotion,
}: {
  active: boolean;
  colorFrom: string;
  colorTo: string;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="relative w-px flex-1" aria-hidden="true">
      <div className="absolute inset-0 bg-(--border-subtle)" />
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-full origin-top",
          prefersReducedMotion ? "" : "transition-transform duration-(--duration-slow) ease-default",
          active ? "scale-y-100" : "scale-y-0",
        )}
        style={{ background: `linear-gradient(to bottom, ${colorFrom}, ${colorTo})` }}
      />
    </div>
  );
}

export function LearningJourney() {
  const steps = [...journey].sort((a, b) => a.order - b.order);
  const prefersReducedMotion = useReducedMotion();
  const { revealed, setNodeRef } = useStaggeredReveal(steps.length, prefersReducedMotion);

  return (
    <section id="recorrido" className="relative overflow-hidden bg-canvas py-20 md:py-32">
      {/* Degradado de fondo muy sutil en morado, detrás del recorrido — no compite
          con el verde/amarillo de los nodos activos porque queda casi imperceptible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 0% 25%, color-mix(in oklab, var(--brand-purple) 9%, transparent) 0%, transparent 70%)",
        }}
      />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funcionaría"
            title="El recorrido del estudiante."
            description="Una visión de cómo podría funcionar el modelo dentro de APIT — todavía en fase de diseño y validación, no una experiencia ya implementada."
          />
        </Reveal>

        <ol className="relative mt-4 flex flex-col md:mt-8">
          {steps.map((step, index) => {
            const isRevealed = revealed[index];
            const isLast = index === steps.length - 1;
            const position = steps.length > 1 ? index / (steps.length - 1) : 0;
            const nodeColor = gradientColorAt(position);
            const nextPosition = steps.length > 1 ? (index + 1) / (steps.length - 1) : 0;

            return (
              <li key={step.id} className="group flex gap-5 md:gap-8">
                {/* Riel: nodo + segmento hacia el siguiente paso */}
                <div className="flex w-8 shrink-0 flex-col items-center md:w-10">
                  <div
                    ref={setNodeRef(index)}
                    data-step-index={index}
                    className={cn(
                      "size-3 shrink-0 rounded-full border md:size-3.5",
                      "group-hover:scale-125",
                      prefersReducedMotion
                        ? ""
                        : "transition-[transform,background-color,border-color,box-shadow] duration-(--duration-base) ease-default",
                    )}
                    style={
                      isRevealed
                        ? {
                            backgroundColor: nodeColor,
                            borderColor: nodeColor,
                            boxShadow: "0 0 0 4px color-mix(in oklab, var(--brand-purple) 25%, transparent)",
                          }
                        : {
                            backgroundColor: "var(--bg-elevated)",
                            borderColor: "var(--border-subtle)",
                          }
                    }
                  />
                  {!isLast ? (
                    <Segment
                      active={revealed[index + 1] ?? false}
                      colorFrom={nodeColor}
                      colorTo={gradientColorAt(nextPosition)}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  ) : null}
                </div>

                {/* Contenido del paso */}
                <div
                  className={cn(
                    "flex flex-col gap-1.5 pb-10 md:pb-12",
                    prefersReducedMotion
                      ? ""
                      : "transition-[opacity,transform] duration-(--duration-slow) ease-default",
                    isRevealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  <span className="font-mono text-xs text-muted">
                    {String(step.order).padStart(2, "0")}
                  </span>
                  <h3
                    className={cn(
                      "font-display text-xl font-medium md:text-2xl",
                      isRevealed ? "text-primary" : "text-secondary",
                      prefersReducedMotion ? "" : "transition-colors duration-(--duration-base) ease-default",
                    )}
                  >
                    {step.label}
                  </h3>
                  <p className="max-w-md font-body text-sm text-secondary md:text-base">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
