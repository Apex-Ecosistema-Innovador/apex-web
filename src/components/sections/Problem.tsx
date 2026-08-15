"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ProblemVisual, type ProblemVisualVariant } from "@/components/visuals/ProblemVisual";
import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { problems, type Problem as ProblemItem } from "@/content/problems";

const VARIANT_BY_ID: Record<string, ProblemVisualVariant> = {
  "ensenanza-tradicional": "rigid-syntax",
  "poca-experimentacion-colaborativa": "isolated-nodes",
  "talento-desapercibido": "hidden-talent",
  "uso-prematuro-ia-generativa": "shortcut",
};

const ACTIVE_DURATION = 200;
const HOVER_QUERY = "(hover: hover)";

function subscribeToHover(callback: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getHoverSnapshot() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function getHoverServerSnapshot() {
  return true;
}

function ProblemCard({ problem, delay }: { problem: ProblemItem; delay: number }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: visualRef, isInView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(false);
  // Solo se usa como fallback en táctil (sin puntero de hover) — en desktop
  // el hover/foco ya cubre la reacción, así que un click ahí no debe
  // interferir apagando lo que el hover acaba de encender.
  const hasHover = useSyncExternalStore(subscribeToHover, getHoverSnapshot, getHoverServerSnapshot);

  function handleClick() {
    // Nunca "toggle": un tap también dispara foco en algunos navegadores, y
    // alternar ahí competiría con onFocus por el mismo estado. En touch,
    // activar es siempre "encender"; se apaga al tocar fuera de la card.
    if (!hasHover) setActive(true);
  }

  useEffect(() => {
    if (hasHover || !active) return;
    function handleOutsidePointer(event: PointerEvent) {
      if (visualRef.current && !visualRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [hasHover, active, visualRef]);

  const revealed = prefersReducedMotion || isInView;
  const variant = VARIANT_BY_ID[problem.id];

  return (
    <Reveal delay={delay}>
      <div
        ref={visualRef}
        tabIndex={0}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onClick={handleClick}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-lg border border-subtle bg-elevated outline-none",
          "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          !prefersReducedMotion && "transition-transform duration-(--duration-fast) ease-default",
          !prefersReducedMotion && active && "-translate-y-1",
        )}
      >
        {/* Degradado sutil de fondo — capa superpuesta, solo cruza opacidad */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: active ? 1 : 0,
            transition: prefersReducedMotion ? undefined : `opacity ${ACTIVE_DURATION}ms var(--ease-default)`,
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--brand-green-pine) 22%, transparent) 0%, transparent 55%, color-mix(in oklab, var(--brand-purple) 16%, transparent) 100%)",
          }}
        />
        {/* Borde de acento — misma técnica: nunca se transiciona border-color
            directamente, se superpone un borde de acento que cruza opacidad */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg border border-principal"
          style={{
            opacity: active ? 1 : 0,
            transition: prefersReducedMotion ? undefined : `opacity ${ACTIVE_DURATION}ms var(--ease-default)`,
          }}
        />

        <div className="border-b border-subtle px-5 pt-5 pb-4 md:px-8 md:pt-8 md:pb-5">
          <span className="font-mono text-3xl text-accent md:text-4xl">{problem.number}</span>
        </div>
        <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5 md:px-8 md:pt-5 md:pb-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-xl font-medium text-primary md:text-2xl">{problem.title}</h3>
            <p className="font-body text-base text-secondary">{problem.description}</p>
          </div>
          <div className="mt-auto pt-2">
            <ProblemVisual variant={variant} revealed={revealed} active={active} prefersReducedMotion={prefersReducedMotion} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Problem() {
  return (
    <section id="problema" className="relative overflow-hidden bg-canvas py-20 md:py-32">
      {/* Atmósfera de fondo — muy sutil, coherente con Hero/BrandIntro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in oklab, var(--brand-green-pine) 10%, transparent) 0%, color-mix(in oklab, var(--brand-purple) 8%, transparent) 55%, transparent 80%)",
        }}
      />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Una oportunidad para evolucionar"
            title="¿Y si aprendemos programación de otra manera?"
            description="Estamos explorando cómo fortalecer la lógica, la práctica, el trabajo en equipo y la resolución de problemas para construir una experiencia de aprendizaje más activa dentro de APIT."
          />
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          {problems.map((problem, index) => (
            <ProblemCard key={problem.id} problem={problem} delay={index * 80} />
          ))}
        </div>
      </Container>
    </section>
  );
}
