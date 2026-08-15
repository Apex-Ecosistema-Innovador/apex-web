"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const routeA = ["Problema", "IA", "Código"];
const routeB = ["Problema", "Análisis", "Abstracción", "Algoritmo", "Código", "IA como potenciador"];

const RESULT_A = "Código entregado. Lógica no desarrollada.";
const RESULT_B = "Código entregado. Lógica construida.";

// Ruta A: casi instantánea, el atajo. Ruta B: paso a paso, deliberada — el
// contraste de ritmo ES el mensaje. Ambas duraciones se derivan de estas
// constantes para que el total se calcule solo si cambia el largo de la ruta.
// (Escaladas ~1.7x respecto a la versión anterior para que se alcance a
// seguir el avance paso a paso, conservando la misma proporción entre rutas.)
const ROUTE_A_STEP_DELAY = 190;
const ROUTE_A_STEP_DURATION = 270;
const ROUTE_B_STEP_DELAY = 700;
const ROUTE_B_STEP_DURATION = 650;

function routeTotal(steps: number, stepDelay: number, stepDuration: number) {
  return (steps - 1) * stepDelay + stepDuration;
}

/** IA aparece como advertencia apagada en el paso central; el resto, gris neutro. */
function routeAColorAt(index: number) {
  return index === 1 ? "color-mix(in oklab, var(--brand-yellow) 45%, var(--text-muted))" : "var(--text-muted)";
}
/** Verde acumulándose paso a paso; el último nodo (IA como potenciador) cierra en morado. */
function routeBColorAt(index: number, total: number) {
  return index === total - 1 ? "var(--brand-purple)" : "var(--brand-green-light)";
}

type Orientation = "horizontal" | "vertical";

function RouteNode({
  color,
  running,
  delay,
  emphasize,
  instant,
  prefersReducedMotion,
}: {
  color: string;
  running: boolean;
  delay: number;
  emphasize?: boolean;
  instant: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-3.5 shrink-0 rounded-full border",
        !prefersReducedMotion && "transition-[background-color,border-color,scale] duration-(--duration-base) ease-default",
      )}
      style={{
        backgroundColor: running ? color : "var(--bg-elevated)",
        borderColor: running ? color : "var(--border-subtle)",
        scale: running ? (emphasize ? 1.35 : 1.12) : 1,
        // El regreso a reposo forzado (instant) nunca hereda el delay
        // escalonado de la animación de avance — si no, "apagar" los nodos
        // se vería tan escalonado como encenderlos, en vez de un reset limpio.
        transitionDelay: prefersReducedMotion || instant ? undefined : `${delay}ms`,
        transitionDuration: instant ? "0ms" : undefined,
      }}
    />
  );
}

function RouteConnector({
  orientation,
  running,
  broken,
  fromColor,
  toColor,
  delay,
  duration,
  instant,
  prefersReducedMotion,
}: {
  orientation: Orientation;
  running: boolean;
  broken?: boolean;
  fromColor: string;
  toColor: string;
  delay: number;
  duration: number;
  instant: boolean;
  prefersReducedMotion: boolean;
}) {
  const isHorizontal = orientation === "horizontal";

  if (broken) {
    // La conexión rota nunca "se traza": solo aparece, débil — algo quedó
    // incompleto, no hay nada que celebrar terminando.
    return (
      <div
        aria-hidden="true"
        className={cn("shrink-0", isHorizontal ? "flex h-3.5 w-6 items-center md:w-8" : "flex w-3.5 flex-col items-center py-1")}
      >
        <div
          className={cn("border-dashed", isHorizontal ? "w-full border-t-2" : "mx-auto h-6 border-l-2")}
          style={{
            borderColor: "var(--text-muted)",
            opacity: running ? 1 : 0,
            transition: prefersReducedMotion || instant ? undefined : `opacity ${duration}ms var(--ease-default)`,
            transitionDelay: prefersReducedMotion || instant ? undefined : `${delay}ms`,
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cn("relative shrink-0", isHorizontal ? "h-3.5 w-6 md:w-8" : "w-3.5 py-1")}>
      <div
        className={cn(
          "absolute bg-(--border-subtle)",
          isHorizontal ? "inset-x-0 top-1/2 h-px -translate-y-1/2" : "inset-y-0 left-1/2 w-px -translate-x-1/2",
        )}
      />
      <div
        className={cn(
          "absolute",
          isHorizontal ? "inset-x-0 top-1/2 h-px origin-left -translate-y-1/2" : "inset-y-0 left-1/2 w-px origin-top -translate-x-1/2",
          !prefersReducedMotion && "transition-transform duration-(--duration-base) ease-default",
        )}
        style={{
          background: `linear-gradient(${isHorizontal ? "to right" : "to bottom"}, ${fromColor}, ${toColor})`,
          transform: running ? (isHorizontal ? "scaleX(1)" : "scaleY(1)") : isHorizontal ? "scaleX(0)" : "scaleY(0)",
          // Mismo motivo que en RouteNode: al forzar el reposo, sin delay ni
          // duración heredados de la coreografía de avance.
          transitionDelay: prefersReducedMotion || instant ? undefined : `${delay}ms`,
          transitionDuration: instant ? "0ms" : undefined,
        }}
      />
    </div>
  );
}

function ComparisonRoute({
  orientation,
  title,
  titleColor,
  steps,
  running,
  instant,
  stepDelay,
  stepDuration,
  colorAt,
  brokenLastConnector,
  prefersReducedMotion,
  resultText,
  className,
}: {
  orientation: Orientation;
  title: string;
  titleColor: string;
  steps: string[];
  running: boolean;
  instant: boolean;
  stepDelay: number;
  stepDuration: number;
  colorAt: (index: number) => string;
  brokenLastConnector?: boolean;
  prefersReducedMotion: boolean;
  resultText: string | null;
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="font-mono text-[11px] tracking-widest uppercase md:text-xs" style={{ color: titleColor }}>
        {title}
      </h3>

      <div className={cn("flex", isHorizontal ? "flex-row items-start" : "flex-col items-start")}>
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;
          const color = colorAt(index);

          return (
            <div key={step} className={cn("flex", isHorizontal ? "flex-row items-start" : "flex-col items-start")}>
              {index > 0 ? (
                <RouteConnector
                  orientation={orientation}
                  running={running}
                  instant={instant}
                  broken={brokenLastConnector && isLastStep}
                  fromColor={colorAt(index - 1)}
                  toColor={color}
                  delay={(index - 1) * stepDelay + stepDuration * 0.4}
                  duration={stepDuration * 0.6}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ) : null}
              <div className={cn("flex", isHorizontal ? "w-16 flex-col items-center gap-2 md:w-20" : "flex-row items-center gap-2 py-0.5")}>
                <RouteNode
                  color={color}
                  running={running}
                  instant={instant}
                  delay={index * stepDelay}
                  emphasize={brokenLastConnector ? false : isLastStep}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <span
                  className={cn(
                    "font-body text-[11px] leading-tight text-secondary md:text-xs",
                    isHorizontal ? "max-w-16 text-center md:max-w-20" : "max-w-32 text-left",
                  )}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className={cn(
          "min-h-4 font-mono text-xs",
          !prefersReducedMotion && "transition-[opacity,transform] duration-(--duration-base) ease-default",
          resultText ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        )}
        style={{ color: titleColor }}
      >
        {resultText ?? ""}
      </p>
    </div>
  );
}

export function AISection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(false);
  // Fuerza que el regreso a reposo sea instantáneo (sin el delay/duración
  // escalonados de la coreografía de avance) — ver el comentario en
  // RouteNode/RouteConnector. Solo se pone en false justo antes de arrancar
  // una animación de avance real.
  const [instant, setInstant] = useState(true);
  const [hasRun, setHasRun] = useState(false);
  const [resultA, setResultA] = useState<string | null>(null);
  const [resultB, setResultB] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  function resetDemo() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setInstant(true);
    setRunning(false);
    setHasRun(false);
    setResultA(null);
    setResultB(null);
  }

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // El botón "se gasta" al usarse (se oculta al terminar la demo) — para no
  // perder la posibilidad de repetirla, si la sección sale del viewport y
  // vuelve a entrar, todo se resetea. `wasInView` solo distingue una
  // reentrada real (false → true) del primer avistamiento (null → true), que
  // no debe disparar un reset.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let wasInView: boolean | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (wasInView === false && entry.isIntersecting) {
          resetDemo();
        }
        wasInView = entry.isIntersecting;
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function handleRun() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setHasRun(true);
    setResultA(null);
    setResultB(null);

    if (prefersReducedMotion) {
      setInstant(true);
      setRunning(true);
      setResultA(RESULT_A);
      setResultB(RESULT_B);
      return;
    }

    // Se apaga primero, de forma instantánea, para que si ya estaba corriendo
    // (o quedó en su estado final) la repetición vuelva a partir de un
    // reposo limpio en vez de saltar directo al final o desactivarse a saltos.
    setInstant(true);
    setRunning(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setInstant(false);
        setRunning(true);
        const totalA = routeTotal(routeA.length, ROUTE_A_STEP_DELAY, ROUTE_A_STEP_DURATION);
        const totalB = routeTotal(routeB.length, ROUTE_B_STEP_DELAY, ROUTE_B_STEP_DURATION);
        timeoutsRef.current.push(window.setTimeout(() => setResultA(RESULT_A), totalA + 200));
        timeoutsRef.current.push(window.setTimeout(() => setResultB(RESULT_B), totalB + 350));
      });
    });
  }

  const sharedRouteProps = { running, instant, prefersReducedMotion } as const;
  const demoComplete = resultA !== null && resultB !== null;

  return (
    <section id="ia" ref={sectionRef} className="bg-surface py-20 md:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Postura sobre IA"
            title="La IA como potenciador, no como atajo"
            description="La IA puede potenciar a quien ya sabe resolver problemas, pero puede convertirse en un atajo cuando reemplaza el desarrollo de la lógica."
          />
        </Reveal>

        <Reveal delay={80}>
          {/* El botón ya cumplió su función una vez la demo termina — se
              desvanece en vez de quedar como "Volver a intentar" ocupando
              espacio. Vuelve a aparecer solo si la sección se abandona y se
              revisita (ver el IntersectionObserver de reseteo arriba). */}
          <div
            aria-hidden={demoComplete}
            className={cn(
              "flex flex-col items-start gap-2",
              !prefersReducedMotion && "transition-opacity duration-(--duration-slow) ease-default",
              demoComplete ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            <Button type="button" variant="primary" onClick={handleRun} tabIndex={demoComplete ? -1 : undefined}>
              Resolver el problema
            </Button>
            {!hasRun ? (
              <p className="font-mono text-xs text-muted">Compara cómo termina cada camino.</p>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={140} className="mt-10 md:mt-14">
          <div className="flex flex-col gap-10 md:gap-12">
            {/* Desktop: dos filas horizontales, comparables de un vistazo */}
            <div className="hidden flex-col gap-10 md:flex md:gap-12">
              <ComparisonRoute
                orientation="horizontal"
                title="Ruta A · Sin fundamento"
                titleColor="var(--text-muted)"
                steps={routeA}
                stepDelay={ROUTE_A_STEP_DELAY}
                stepDuration={ROUTE_A_STEP_DURATION}
                colorAt={routeAColorAt}
                brokenLastConnector
                resultText={resultA}
                {...sharedRouteProps}
              />
              <ComparisonRoute
                orientation="horizontal"
                title="Ruta B · Con fundamento"
                titleColor="var(--brand-green-light)"
                steps={routeB}
                stepDelay={ROUTE_B_STEP_DELAY}
                stepDuration={ROUTE_B_STEP_DURATION}
                colorAt={(index) => routeBColorAt(index, routeB.length)}
                resultText={resultB}
                {...sharedRouteProps}
              />
            </div>

            {/* Móvil: mismas rutas, lado a lado en columnas — el contraste de
                longitud (corta vs larga) se sigue leyendo de un vistazo */}
            <div className="flex flex-row gap-4 md:hidden">
              <ComparisonRoute
                orientation="vertical"
                title="Ruta A"
                titleColor="var(--text-muted)"
                steps={routeA}
                stepDelay={ROUTE_A_STEP_DELAY}
                stepDuration={ROUTE_A_STEP_DURATION}
                colorAt={routeAColorAt}
                brokenLastConnector
                resultText={resultA}
                className="flex-1"
                {...sharedRouteProps}
              />
              <ComparisonRoute
                orientation="vertical"
                title="Ruta B"
                titleColor="var(--brand-green-light)"
                steps={routeB}
                stepDelay={ROUTE_B_STEP_DELAY}
                stepDuration={ROUTE_B_STEP_DURATION}
                colorAt={(index) => routeBColorAt(index, routeB.length)}
                resultText={resultB}
                className="flex-1"
                {...sharedRouteProps}
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={180} className="mt-12 md:mt-16">
          <p className="max-w-2xl font-display text-xl font-medium text-primary md:text-2xl">
            La IA puede escribir código. Pero primero tú debes aprender a pensar.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
