"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { Reveal } from "@/components/ui/Reveal";
import { NodeGraph } from "@/components/visuals/NodeGraph";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Indicador de scroll discreto — invita a bajar, se desvanece apenas el
 *  usuario empieza a hacer scroll. El bob vertical es la única excepción de
 *  motion en loop del sitio, pedida explícitamente para este elemento. */
function ScrollIndicator() {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 48);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center md:bottom-10",
        !prefersReducedMotion && "transition-opacity duration-(--duration-slow) ease-default",
        scrolled ? "opacity-0" : "opacity-70",
      )}
    >
      <div
        className="flex flex-col items-center gap-2"
        style={
          !prefersReducedMotion
            ? { animation: "hero-scroll-hint 2200ms ease-in-out infinite" }
            : undefined
        }
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Scroll</span>
        <span className="h-8 w-px bg-(--border-default)" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-canvas pt-24"
    >
      {/* Atmósfera de fondo — morado con un toque de verde, difusa y contenida
          detrás del grafo, sin restar legibilidad al titular */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 62% 58% at 82% 38%, color-mix(in oklab, var(--brand-purple) 22%, transparent) 0%, color-mix(in oklab, var(--brand-green-pine) 14%, transparent) 42%, transparent 72%)",
        }}
      />

      <Container>
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[3fr_2fr] md:gap-16">
          <div className="flex flex-col gap-6">
            <Reveal>
              <PhaseTag status="actual" label="FASE 1 · DISEÑO Y VALIDACIÓN" />
            </Reveal>

            <Reveal delay={80}>
              <h1 className="max-w-xl font-display text-5xl font-medium tracking-tight text-primary md:text-7xl">
                El código empieza antes de escribir código.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="max-w-lg font-body text-lg text-secondary md:text-xl">
                Un modelo metodológico en diseño y validación que busca transformar
                cómo los estudiantes de APIT desarrollan lógica, aprenden programación,
                enfrentan retos y descubren su potencial.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="primary" href="#problema" className="w-full sm:w-auto">
                  Descubre el proyecto
                </Button>
                <Button variant="secondary" href="#modelo" className="w-full sm:w-auto">
                  Conoce cómo funcionará
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Sin Reveal: el propio NodeGraph gestiona su entrada (se
              construye en secuencia al montar), en paralelo con el texto */}
          <div className="flex justify-center md:justify-end">
            <NodeGraph />
          </div>
        </div>
      </Container>

      <ScrollIndicator />
    </section>
  );
}
