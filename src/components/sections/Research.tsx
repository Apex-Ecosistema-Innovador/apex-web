"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhaseTag } from "@/components/ui/PhaseTag";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { methodology } from "@/content/methodology";
import { roadmap } from "@/content/roadmap";

interface ResearchPhase {
  id: string;
  label: string;
  description: string;
}

const researchPhases: ResearchPhase[] = [
  {
    id: "diagnosticar",
    label: "Diagnosticar",
    description:
      "Comprender dificultades, metodologías actuales y factores de reprobación a partir de la literatura y el contexto del APIT.",
  },
  {
    id: "disenar",
    label: "Diseñar",
    description: "Construir la arquitectura metodológica del modelo a partir del diagnóstico.",
  },
  {
    id: "validar",
    label: "Validar",
    description:
      "Evaluar el modelo con expertos, docentes y estudiantes mediante grupos focales e instrumentos de validación.",
  },
];

const tabs = [
  { id: "fase", label: "Fase actual" },
  { id: "metodologia", label: "Metodología" },
  { id: "ruta", label: "Ruta" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function Research() {
  const [activeTab, setActiveTab] = useState<TabId>("fase");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedRoadmap = [...roadmap].sort((a, b) => a.order - b.order);

  function selectTab(id: TabId) {
    if (id === activeTab) return;

    if (prefersReducedMotion) {
      setActiveTab(id);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsTransitioning(true);
    timeoutRef.current = setTimeout(() => {
      setActiveTab(id);
      requestAnimationFrame(() => setIsTransitioning(false));
    }, 120);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section id="investigacion" className="relative overflow-hidden bg-canvas py-20 md:py-32">
      {/* Atmósfera de fondo — la más contenida del sitio: esta sección aporta
          rigor académico, así que la insinuación de color debe ser apenas
          perceptible, nunca competir con el tono sobrio del contenido. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 0%, color-mix(in oklab, var(--brand-purple) 6%, transparent) 0%, color-mix(in oklab, var(--brand-green-pine) 5%, transparent) 45%, transparent 75%)",
        }}
      />

      <Container>
        <Reveal>
          <PhaseTag status="actual" label="FASE 1 · DISEÑO Y VALIDACIÓN" />
        </Reveal>

        <Reveal delay={80} className="mt-4">
          <SectionHeading
            eyebrow="La investigación"
            title="Investigación antes que improvisación."
            description="El modelo no se construye desde la intuición: se fundamenta, se diseña y se valida."
          />
        </Reveal>

        <Reveal delay={160}>
          <div
            role="tablist"
            aria-label="Secciones de la investigación"
            className="flex gap-1 border-b border-subtle"
          >
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`research-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`research-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    "relative px-3 py-3 font-mono text-xs tracking-wide uppercase outline-none md:px-4 md:text-sm",
                    "transition-colors duration-(--duration-fast) ease-default",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    isActive ? "text-primary" : "text-muted hover:text-secondary",
                  )}
                >
                  {tab.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 -bottom-px h-0.5 md:inset-x-4",
                      "transition-colors duration-(--duration-fast) ease-default",
                      isActive ? "bg-brand-purple-accessible" : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div
            className={cn(
              "mt-8",
              prefersReducedMotion
                ? ""
                : "transition-[opacity,transform] duration-(--duration-fast) ease-default",
              isTransitioning ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {activeTab === "fase" ? (
              <div
                id="research-panel-fase"
                role="tabpanel"
                aria-labelledby="research-tab-fase"
                tabIndex={0}
              >
                <p className="mb-6 max-w-2xl font-body text-secondary">
                  Esto es lo que está ocurriendo ahora: la Fase 1 se compone de tres momentos
                  encadenados.
                </p>
                <div className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
                  {researchPhases.map((phase, index) => (
                    <div key={phase.id} className="flex flex-1 items-stretch">
                      <div className="flex flex-1 flex-col gap-2 rounded-lg border border-subtle bg-elevated p-5">
                        <span className="font-mono text-xs text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-lg font-medium text-primary">
                          {phase.label}
                        </h3>
                        <p className="font-body text-sm text-secondary">{phase.description}</p>
                      </div>
                      {index < researchPhases.length - 1 ? (
                        <div className="hidden w-8 shrink-0 items-center justify-center md:flex">
                          <span
                            aria-hidden="true"
                            className="h-px w-6 bg-brand-purple-accessible/50"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "metodologia" ? (
              <div
                id="research-panel-metodologia"
                role="tabpanel"
                aria-labelledby="research-tab-metodologia"
                tabIndex={0}
              >
                <p className="mb-6 max-w-2xl font-body text-secondary">
                  Cuatro instrumentos sostienen el diseño y la validación del modelo.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {methodology.map((instrument) => (
                    <div
                      key={instrument.id}
                      className="flex flex-col gap-2 rounded-lg border border-subtle bg-elevated p-5"
                    >
                      <h3 className="font-display text-base font-medium text-primary">
                        {instrument.name}
                      </h3>
                      <p className="font-mono text-xs tracking-wide text-accent uppercase">
                        {instrument.audience}
                      </p>
                      <p className="font-body text-sm text-secondary">{instrument.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "ruta" ? (
              <div
                id="research-panel-ruta"
                role="tabpanel"
                aria-labelledby="research-tab-ruta"
                tabIndex={0}
              >
                <p className="mb-6 max-w-2xl font-body text-secondary">
                  Seis etapas. Las primeras cinco están en curso; la última todavía no ha
                  ocurrido.
                </p>
                <ul className="flex flex-col gap-3">
                  {sortedRoadmap.map((phase) => {
                    const isFuture = phase.status === "futuro";
                    return (
                      <li
                        key={phase.id}
                        className={cn(
                          "flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4",
                          isFuture ? "border-subtle" : "border-default bg-elevated",
                        )}
                      >
                        <PhaseTag
                          status={phase.status}
                          label={isFuture ? "Futuro" : "Actual"}
                        />
                        <div>
                          <p
                            className={cn(
                              "font-display text-sm font-medium",
                              isFuture ? "text-muted" : "text-primary",
                            )}
                          >
                            {phase.label}
                          </p>
                          <p
                            className={cn(
                              "font-body text-sm",
                              isFuture ? "text-muted" : "text-secondary",
                            )}
                          >
                            {phase.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
