"use client";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PathStep {
  id: string;
  label: string;
  description: string;
}

const steps: PathStep[] = [
  {
    id: "primer-problema",
    label: "Primer problema",
    description:
      "Tu primer enfrentamiento con la lógica: descomponer un problema y pensar la solución antes de escribir una sola línea.",
  },
  {
    id: "primer-reto",
    label: "Primer reto",
    description:
      "Pones a prueba lo aprendido en un desafío con tiempo y restricciones. Aquí aprendes a resolver bajo presión.",
  },
  {
    id: "equipo",
    label: "Equipo",
    description: "Dejas de resolver solo. Aprendes a dividir problemas, comunicar ideas y construir en conjunto.",
  },
  {
    id: "challenge-interno",
    label: "Challenge interno",
    description: "Compites de forma sana con tus propios compañeros. La competencia como forma de mejorar, no de ganar.",
  },
  {
    id: "hackathon",
    label: "Hackathon",
    description: "Construyes una solución real contra el reloj. Ideación, código y presentación en un mismo desafío.",
  },
  {
    id: "icpc",
    label: "ICPC / competencias",
    description:
      "El ICPC es la competencia de programación universitaria más importante del mundo. Aquí representas a tu institución frente a las mejores universidades: la cima del recorrido... y el punto de partida de algo más grande.",
  },
];

/** Color de un peldaño según su posición (0..1) en el ascenso, interpolando
 *  morado → verde claro → amarillo — mismo criterio que el trazado de
 *  LearningJourney, para que el degradado se lea como un mismo lenguaje de
 *  marca aunque la composición sea distinta. Aquí es también la estructura
 *  visual de la escalera (el relleno de cada escalón), no solo una línea. */
function gradientColorAt(position: number) {
  if (position <= 0.5) {
    const t = position / 0.5;
    return `color-mix(in oklab, var(--brand-purple), var(--brand-green-light) ${t * 100}%)`;
  }
  const t = (position - 0.5) / 0.5;
  return `color-mix(in oklab, var(--brand-green-light), var(--brand-yellow) ${t * 100}%)`;
}

// Cada peldaño = una tarjeta (número + etiqueta) apoyada sobre un escalón
// sólido (el "contrahuella") cuya altura crece con el índice — así los
// escalones quedan pegados unos a otros, formando una silueta continua de
// escalera en vez de tarjetas flotando en el aire.
const CARD_W = 152; // px — ancho del peldaño en desktop
const CARD_H = 92; // px — alto de la tarjeta (número + etiqueta) en desktop
const SUMMIT_CARD_W = 172;
const SUMMIT_CARD_H = 104;
const RISER_BASE = 16; // px — contrahuella del primer escalón
const RISER_STEP = 34; // px — cuánto crece la contrahuella por cada escalón

const MOBILE_CARD_H = 76;
const MOBILE_SUMMIT_H = 88;
const MOBILE_INDENT = 16; // px — desplazamiento horizontal progresivo por peldaño
const MOBILE_ROW_HEIGHT = MOBILE_CARD_H + 22; // separación vertical aproximada entre peldaños

export function CompetitivePath() {
  const prefersReducedMotion = useReducedMotion();

  const mobileRun = (steps.length - 1) * MOBILE_INDENT;
  const mobileRise = (steps.length - 1) * MOBILE_ROW_HEIGHT;
  const mobileRampLength = Math.hypot(mobileRun, mobileRise);
  // El bloque por defecto apunta hacia abajo (0, +1); rotamos hasta el vector
  // objetivo (deriva horizontal pequeña, caída vertical grande).
  const mobileAngleDeg = (Math.atan2(mobileRise, mobileRun) * 180) / Math.PI - 90;

  const cardTransitionClass = prefersReducedMotion
    ? ""
    : "transition-[transform,border-color] duration-(--duration-fast) ease-default";
  const popupTransitionClass = prefersReducedMotion
    ? ""
    : "transition-[opacity,transform] duration-(--duration-fast) ease-default";

  return (
    <section id="camino-competitivo" className="relative overflow-hidden bg-surface py-20 md:py-32">
      {/* Degradado de fondo muy sutil, ascendente, con morado — no compite con
          el verde/amarillo de los peldaños activos porque queda casi imperceptible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top right, color-mix(in oklab, var(--brand-purple) 10%, transparent) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 0%, color-mix(in oklab, var(--brand-yellow) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Como estudiante, del aula a la competencia"
            title="Un ascenso, paso a paso."
            description="Una visión de progresión hacia la programación competitiva, y un camino que el modelo busca hacer posible. Tú como estudiante esto es a lo que te enfrentaras en el aula"
          />
        </Reveal>

        {/* Desktop: escalera diagonal ascendente, escalones sólidos y conectados */}
        <div className="relative isolate mt-16 hidden md:flex md:items-end">
          {steps.map((step, index) => {
            const position = index / (steps.length - 1);
            const isSummit = index === steps.length - 1;
            const riserHeight = RISER_BASE + index * RISER_STEP;
            const color = gradientColorAt(position);

            return (
              <div
                key={step.id}
                className="relative z-0 flex flex-col items-stretch hover:z-20 focus-within:z-20"
                style={{ width: isSummit ? SUMMIT_CARD_W : CARD_W }}
              >
                <Reveal delay={index * 60}>
                  <StepCard
                    step={step}
                    index={index}
                    isSummit={isSummit}
                    height={isSummit ? SUMMIT_CARD_H : CARD_H}
                    color={color}
                    popupPosition="top"
                    cardTransitionClass={cardTransitionClass}
                    popupTransitionClass={popupTransitionClass}
                  />
                </Reveal>
                <div
                  aria-hidden="true"
                  className="border-t border-t-(--border-subtle)"
                  style={{ height: riserHeight, backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>

        {/* Móvil: escalera vertical con indentación progresiva pequeña */}
        <div className="relative isolate mt-8 flex flex-col gap-6 md:hidden">
          <div
            aria-hidden="true"
            className="absolute -z-10"
            style={{
              left: 20,
              top: 20,
              width: 3,
              height: mobileRampLength,
              transformOrigin: "top left",
              transform: `rotate(${mobileAngleDeg}deg)`,
              background: "linear-gradient(to bottom, var(--brand-purple), var(--brand-green-light), var(--brand-yellow))",
              opacity: 0.6,
            }}
          />

          {steps.map((step, index) => {
            const position = index / (steps.length - 1);
            const isSummit = index === steps.length - 1;
            const indent = index * MOBILE_INDENT;

            return (
              <div
                key={step.id}
                className="relative z-0 hover:z-20 focus-within:z-20"
                style={{ marginLeft: indent, width: `calc(100% - ${indent}px)`, maxWidth: 320 }}
              >
                <Reveal delay={index * 60}>
                  <StepCard
                    step={step}
                    index={index}
                    isSummit={isSummit}
                    height={isSummit ? MOBILE_SUMMIT_H : MOBILE_CARD_H}
                    color={gradientColorAt(position)}
                    popupPosition="bottom"
                    cardTransitionClass={cardTransitionClass}
                    popupTransitionClass={popupTransitionClass}
                  />
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function StepCard({
  step,
  index,
  isSummit,
  height,
  color,
  popupPosition,
  cardTransitionClass,
  popupTransitionClass,
}: {
  step: PathStep;
  index: number;
  isSummit: boolean;
  height: number;
  color: string;
  popupPosition: "top" | "bottom";
  cardTransitionClass: string;
  popupTransitionClass: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex w-full flex-col justify-between rounded-t-lg border border-b-0 bg-elevated p-3 text-left outline-none",
        "hover:-translate-y-1 focus:-translate-y-1",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        cardTransitionClass,
        "border-subtle hover:border-brand-purple-accessible focus:border-brand-purple-accessible",
        isSummit && "border-brand-yellow/50",
      )}
      style={{ height }}
    >
      <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>

      <h3
        className="font-display text-sm font-medium text-primary md:text-base"
        style={{ color: isSummit ? color : undefined }}
      >
        {step.label}
      </h3>

      {isSummit ? (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 rounded-lg border border-brand-yellow/60 bg-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-brand-yellow"
          style={{ boxShadow: "0 6px 20px -6px color-mix(in oklab, var(--brand-yellow) 45%, transparent)" }}
        >
          Meta
        </span>
      ) : null}

      {/* Panel de descripción completa — se posiciona fuera de la tarjeta para
          tener espacio real (2-3 líneas) sin truncar, sin afectar la altura
          fija que sostiene la geometría de la escalera. */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 z-30 w-60 -translate-x-1/2 rounded-lg border border-subtle bg-elevated p-3 text-left shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]",
          popupPosition === "top" ? "bottom-full mb-2" : "top-full mt-2",
          popupTransitionClass,
          "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100",
        )}
      >
        <p className="font-body text-xs leading-relaxed text-secondary">{step.description}</p>
      </div>
    </button>
  );
}
