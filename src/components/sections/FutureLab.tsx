"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LabBlueprint, labZones, getLabZoneAccent } from "@/components/visuals/LabBlueprint";

function HintCursorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2L13 8L8 9.3L6.3 14L3 2Z"
        fill="var(--brand-green-light)"
        stroke="var(--brand-green-light)"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FutureLab() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function handleActivate(id: string | null) {
    if (id !== null) setHasInteracted(true);
    setActiveId(id);
  }

  return (
    <section id="vision" className="relative overflow-hidden bg-canvas py-20 md:py-32">
      {/* Fondo atmosférico — el más trabajado del sitio: esta es la sección
          que se permite ser visualmente más rica, con morado dominante y un
          toque de verde/amarillo insinuando la energía de las zonas activas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 12% 15%, color-mix(in oklab, var(--brand-purple) 22%, transparent) 0%, transparent 70%), radial-gradient(ellipse 55% 55% at 92% 88%, color-mix(in oklab, var(--brand-green-light) 9%, transparent) 0%, transparent 72%)",
        }}
      />

      <Container>
        <Reveal>
          <PhaseTag status="futuro" label="VISIÓN · CONCEPTO PROYECTADO" />
        </Reveal>

        <Reveal delay={80} className="mt-4">
          <SectionHeading
            eyebrow="La visión"
            title="Un espacio diseñado para pensar, construir y competir."
            description="Una visión del ecosistema que podría acompañar el modelo."
          />
        </Reveal>

        <Reveal delay={160}>
          <div className="relative overflow-hidden rounded-lg border border-subtle bg-canvas/60 p-4 md:p-8">
            <LabBlueprint activeId={activeId} onActivate={handleActivate} />

            {/* Pista de exploración — vive SOBRE el plano, no debajo. Se
                desvanece para siempre en cuanto el usuario interactúa por
                primera vez; sigue disponible para lectores de pantalla
                mientras esté visualmente desvanecida (solo opacity, nunca
                display/visibility/aria-hidden en este contenedor). */}
            <div
              className={cn(
                "pointer-events-none absolute right-3 bottom-3 flex items-center gap-2 rounded-lg border border-subtle bg-elevated/90 px-3 py-2 backdrop-blur-sm md:right-4 md:bottom-4",
                prefersReducedMotion ? "" : "transition-opacity duration-(--duration-base) ease-default",
                hasInteracted ? "opacity-0" : "opacity-100",
              )}
              style={
                !prefersReducedMotion && !hasInteracted
                  ? { animation: "lab-hint-float 2600ms ease-in-out infinite" }
                  : undefined
              }
            >
              <HintCursorIcon />
              <span className="font-mono text-[11px] tracking-wide text-secondary uppercase">
                <span className="md:hidden">Toca las zonas del plano</span>
                <span className="hidden md:inline">Explora las zonas del plano</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Móvil: lista de zonas tocables — el plano de arriba se ilumina en conjunto */}
        <div className="mt-4 flex flex-col gap-2 md:hidden">
          {labZones.map((zone, index) => {
            const isActive = activeId === zone.id;
            const accent = getLabZoneAccent(zone.id);
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleActivate(isActive ? null : zone.id)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-elevated px-4 py-3 text-left outline-none",
                  "transition-colors duration-(--duration-fast) ease-default",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  isActive ? "border-brand-purple-accessible" : "border-subtle",
                )}
              >
                <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className="font-display text-sm font-medium"
                  style={{ color: isActive ? accent : "var(--text-primary)" }}
                >
                  {zone.name}
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
