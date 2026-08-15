import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";
import { BrandNodes } from "@/components/visuals/BrandNodes";

export function BrandIntro() {
  return (
    <section
      id="quienes-somos"
      className="relative flex min-h-screen items-center overflow-hidden bg-canvas pt-24"
    >
      {/* Brillo decorativo en la esquina inferior derecha — verde y amarillo dominan,
          morado entra como tercer tono de apoyo, más tenue, en el mismo degradado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 100% 100%, color-mix(in oklab, var(--brand-yellow) 20%, transparent) 0%, color-mix(in oklab, var(--brand-green-light) 15%, transparent) 38%, color-mix(in oklab, var(--brand-purple) 10%, transparent) 58%, transparent 80%)",
        }}
      />

      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[3fr_2fr] md:gap-16">
          {/* Contenido de texto: logo+wordmark, slogan, descripción — alineado a la izquierda */}
          <div className="flex flex-col items-start gap-6 text-left">
            <Reveal>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 md:gap-8">
                <Image
                  src="/brand/logo.png"
                  alt="Logotipo APEX"
                  width={701}
                  height={653}
                  priority
                  className="h-24 w-auto object-contain sm:h-32 md:h-44 lg:h-56"
                />
                {/* Wordmark con un halo morado difuso detrás, para darle profundidad sin restar legibilidad */}
                <div className="relative inline-block">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-14 -z-10 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(closest-side, color-mix(in oklab, var(--brand-purple) 45%, transparent), transparent 72%)",
                    }}
                  />
                  <Image
                    src="/brand/wordmark.png"
                    alt="APEX"
                    width={1536}
                    height={1024}
                    priority
                    className="relative h-24 w-auto object-contain sm:h-32 md:h-44 lg:h-56"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <p className="max-w-xl font-display text-2xl font-medium text-primary md:text-4xl">
                La cima no es el límite, es el punto de partida.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <p className="max-w-lg font-body text-sm text-secondary md:text-base">
                APEX es una iniciativa de investigación del Semillero SIIC en el Politécnico
                Colombiano Jaime Isaza Cadavid. Diseñamos un modelo metodológico que busca
                transformar cómo se aprende lógica y programación en APIT: con refuerzo, retos
                y crecimiento continuo.
              </p>
            </Reveal>
          </div>

          {/* Nodos morados en cascada, compactos, en el mismo lenguaje del NodeGraph del Hero */}
          <div className="flex justify-center md:justify-end">
            <BrandNodes />
          </div>
        </div>
      </Container>
    </section>
  );
}
