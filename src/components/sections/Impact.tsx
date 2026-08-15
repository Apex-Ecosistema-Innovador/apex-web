"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { stats, type Stat } from "@/content/stats";
import { impact, type ImpactStatement } from "@/content/impact";

const COUNT_DURATION_MS = 900;
const COUNT_STAGGER_MS = 120;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Verde claro → amarillo, mismo degradado que el resto del sitio usa como acento por posición. */
function accentAt(position: number) {
  return `color-mix(in oklab, var(--brand-green-light), var(--brand-yellow) ${position * 100}%)`;
}

/**
 * Cuenta hacia arriba SOLO los tramos numéricos del string original (soporta
 * rangos "30%–60%" y signos "+45%"), preservando cualquier otro carácter tal
 * cual. En progreso 1 el resultado es idéntico byte a byte al valor fuente —
 * nunca se inventa precisión que stats.ts no tenga.
 */
function useCountUpFormatted(
  value: string,
  active: boolean,
  reducedMotion: boolean,
  delayMs: number,
) {
  const [display, setDisplay] = useState(() => value.replace(/\d+/g, "0"));
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    if (reducedMotion) return;

    const matches = [...value.matchAll(/\d+/g)];
    const targets = matches.map((match) => parseInt(match[0], 10));
    let rafId = 0;
    let startTime: number | null = null;

    const timeoutId = window.setTimeout(() => {
      const tick = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / COUNT_DURATION_MS, 1);
        const eased = easeOutCubic(progress);

        let result = "";
        let lastIndex = 0;
        matches.forEach((match, index) => {
          const matchIndex = match.index ?? 0;
          result += value.slice(lastIndex, matchIndex);
          result += String(Math.round(targets[index] * eased));
          lastIndex = matchIndex + match[0].length;
        });
        result += value.slice(lastIndex);
        setDisplay(result);

        if (progress < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active, reducedMotion, value, delayMs]);

  return active && reducedMotion ? value : display;
}

function StatBlock({
  stat,
  index,
  active,
  reducedMotion,
}: {
  stat: Stat;
  index: number;
  active: boolean;
  reducedMotion: boolean;
}) {
  const display = useCountUpFormatted(stat.value, active, reducedMotion, index * COUNT_STAGGER_MS);

  return (
    <div className="flex flex-col gap-2 border-l border-subtle pl-5">
      <p
        className="font-display text-4xl font-medium tracking-tight tabular-nums md:text-5xl"
        style={{ color: "var(--brand-yellow)" }}
      >
        {display}
      </p>
      <p className="font-body text-sm text-secondary md:text-base">{stat.label}</p>
      <p className="font-mono text-xs text-muted">Fuente: {stat.source}</p>
    </div>
  );
}

/** Bisagra narrativa: de lo frío/documentado a lo vivo/proyectado. Un solo trazo, una sola vez. */
function NarrativeBridge() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const drawn = reducedMotion || isInView;

  return (
    <div ref={ref} className="my-14 flex flex-col gap-3 md:my-20">
      <div
        aria-hidden="true"
        className={cn(
          "h-px w-full origin-left bg-(--border-default)",
          reducedMotion ? "" : "scale-x-0 transition-transform duration-(--duration-slow) ease-default",
          drawn ? "scale-x-100" : "",
        )}
      />
      <p className="font-mono text-xs tracking-wide uppercase">
        <span className="text-muted">De los datos documentados a </span>
        <span className="text-accent">lo que el modelo busca construir.</span>
      </p>
    </div>
  );
}

function ImpactCard({
  item,
  index,
  total,
  activeId,
  onActivate,
}: {
  item: ImpactStatement;
  index: number;
  total: number;
  activeId: string | null;
  onActivate: (id: string) => void;
}) {
  const isActive = activeId === item.id;
  const position = total > 1 ? index / (total - 1) : 0;
  const accent = accentAt(position);

  return (
    <div
      tabIndex={0}
      onClick={() => onActivate(item.id)}
      data-active={isActive}
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-subtle bg-elevated p-6 outline-none",
        // tailwind-merge trata "outline" y "outline-2" como el mismo grupo de
        // conflicto y descarta el primero — se fija outline-style aparte para
        // que sobreviva al merge. Ver hallazgo reportado al usuario.
        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      )}
    >
      {/* Degradado morado — capa superpuesta, se revela solo vía opacity (nunca se anima el gradiente en sí). */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--duration-base) ease-default",
          "group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[active=true]:opacity-100",
        )}
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 12% 0%, color-mix(in oklab, var(--brand-purple) 30%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* Borde de acento — anillo independiente, también revelado solo por opacity. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg border-2 opacity-0 transition-opacity duration-(--duration-base) ease-default",
          "group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[active=true]:opacity-100",
        )}
        style={{ borderColor: "var(--accent)" }}
      />

      {/* Línea de detalle que se traza al activarse la card. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-6 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-(--duration-base) ease-default",
          "group-hover:scale-x-100 group-focus-visible:scale-x-100 group-data-[active=true]:scale-x-100",
        )}
        style={{ backgroundColor: "var(--accent)" }}
      />

      <div className="relative flex flex-col gap-2">
        <h3
          className={cn(
            "font-display text-lg font-medium text-primary transition-transform duration-(--duration-fast) ease-default",
            "group-hover:translate-x-1 group-focus-visible:translate-x-1 group-data-[active=true]:translate-x-1",
          )}
        >
          {item.title}
        </h3>
        <p className="font-body text-sm text-secondary">{item.description}</p>
      </div>
    </div>
  );
}

export function Impact() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const { ref: statsRef, isInView: statsInView } = useInView<HTMLDivElement>();
  const reducedMotion = useReducedMotion();

  return (
    <section id="impacto" className="relative overflow-hidden bg-canvas py-20 md:py-32">
      {/* Atmósfera de fondo — anclada abajo-derecha, del lado de "lo que
          busca el modelo" (Parte B, viva, con morado), para no competir con
          las cifras frías de la Parte A ni con su contraste en amarillo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 75% 85%, color-mix(in oklab, var(--brand-purple) 6%, transparent) 0%, color-mix(in oklab, var(--brand-green-light) 4%, transparent) 35%, color-mix(in oklab, var(--brand-yellow) 3%, transparent) 55%, transparent 75%)",
        }}
      />

      <Container>
        <Reveal>
          <PhaseTag status="actual" label="FASE 1 · CONTEXTO Y PROYECCIÓN" />
        </Reveal>

        <Reveal delay={80} className="mt-4">
          <SectionHeading
            eyebrow="Impacto"
            title="Un problema documentado. Un modelo que busca cambiarlo."
            description="Antes de mostrar lo que el modelo aspira a lograr, esto es lo que otras investigaciones ya documentan sobre el problema en la región."
          />
        </Reveal>

        {/* Parte A — cifras del problema, de terceros. Sobria, fría, sin morado. */}
        <Reveal delay={160}>
          <p className="font-mono text-xs tracking-widest text-secondary uppercase md:text-sm">
            El punto de partida
          </p>
          <p className="mt-2 max-w-2xl font-body text-secondary md:text-base">
            Cifras de terceros sobre el problema — no son resultados de APEX. El proyecto está en
            Fase 1 y todavía no ha medido nada.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div ref={statsRef} className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {stats.map((stat, index) => (
              <StatBlock
                key={stat.id}
                stat={stat}
                index={index}
                active={statsInView}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </Reveal>

        <NarrativeBridge />

        {/* Parte B — aspiraciones del modelo, en condicional. Viva, con morado. */}
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-accent uppercase md:text-sm">
            Lo que busca el modelo
          </p>
          <p className="mt-2 max-w-2xl font-body text-secondary md:text-base">
            Esto es lo que el modelo aspira a lograr, en condicional, mientras avanza la Fase 1.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {impact.map((item, index) => (
              <ImpactCard
                key={item.id}
                item={item}
                index={index}
                total={impact.length}
                activeId={activeCardId}
                onActivate={setActiveCardId}
              />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
