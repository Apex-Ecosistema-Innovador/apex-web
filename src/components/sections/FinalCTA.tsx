"use client";

import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Mancha de fondo difuminada que "respira" — muy lenta, con delay negativo para no sincronizar con las demás. */
function BreathingBlob({
  className,
  color,
  durationMs,
  delayMs,
  animate,
}: {
  className: string;
  color: string;
  durationMs: number;
  delayMs: number;
  animate: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute rounded-full blur-3xl", className)}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: animate
          ? `cta-breathe ${durationMs}ms ease-in-out ${-delayMs}ms infinite`
          : undefined,
        opacity: animate ? undefined : 0.9,
      }}
    />
  );
}

export function FinalCTA() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const revealed = prefersReducedMotion || isInView;

  return (
    <section id="cierre" className="relative overflow-hidden pt-20 pb-4 md:pt-28 md:pb-12">
      {/* Fondo — la única sección clara y viva del sitio. Degradado orgánico
          verde → amarillo con morado con presencia clara (franja difusa +
          mancha), nunca banda dura. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: "var(--brand-yellow)" }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-green-pine) 0%, var(--brand-green-light) 48%, var(--brand-yellow) 100%)",
          }}
        />
        {/* Franja difusa de morado, estática — le da presencia constante a la
            composición además de la mancha que respira. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklch, var(--brand-purple) 55%, transparent) 0%, transparent 50%)",
          }}
        />
        <BreathingBlob
          className="-top-1/3 -left-1/4 h-[85%] w-[85%]"
          color="color-mix(in oklch, var(--brand-green-pine) 65%, transparent)"
          durationMs={17000}
          delayMs={0}
          animate={!prefersReducedMotion}
        />
        <BreathingBlob
          className="-right-1/4 -bottom-1/3 h-[95%] w-[95%]"
          color="color-mix(in oklch, var(--brand-yellow) 75%, transparent)"
          durationMs={21000}
          delayMs={7000}
          animate={!prefersReducedMotion}
        />
        <BreathingBlob
          className="-top-1/3 -left-1/3 h-3/4 w-3/4"
          color="color-mix(in oklch, var(--brand-purple) 75%, transparent)"
          durationMs={19000}
          delayMs={12000}
          animate={!prefersReducedMotion}
        />
        {/* Fusión superior — el degradado emerge del negro de la sección
            anterior en vez de cortar en seco. Solo una franja alta, para no
            invadir el contenido de una sección ya compacta. */}
        <div
          className="absolute inset-x-0 top-0 h-16 md:h-24"
          style={{ background: "linear-gradient(to bottom, var(--bg-base) 0%, transparent 100%)" }}
        />
      </div>

      <Container>
        <div ref={ref} className="relative flex flex-col items-center gap-3 text-center md:gap-5">
          <div
            className={cn(
              "flex justify-center",
              prefersReducedMotion
                ? ""
                : "transition-[opacity,scale] duration-(--duration-slow) ease-default",
              revealed ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            <Image
              src="/brand/logo-white.png"
              alt="APEX"
              width={256}
              height={256}
              className="h-12 w-12 object-contain sm:h-14 sm:w-14 md:h-20 md:w-20"
              priority={false}
            />
          </div>

          <Reveal delay={120}>
            <h2
              className="font-display text-2xl font-medium tracking-tight md:text-4xl"
              style={{ color: "var(--brand-charcoal)" }}
            >
              Esto apenas comienza.
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p
              className="max-w-xl font-body text-sm md:text-base"
              style={{ color: "var(--brand-charcoal)" }}
            >
              Estamos diseñando una nueva forma de fortalecer el aprendizaje de programación en
              APIT. La Fase 1 es solo el primer escalón.
            </p>
          </Reveal>

          <Reveal delay={280} className="mt-1 w-full sm:w-auto">
            <Button
              href="#modelo"
              variant="primary"
              className="w-full border-transparent bg-(--brand-charcoal) text-primary hover:opacity-90 sm:w-auto"
            >
              Conoce el proyecto
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
