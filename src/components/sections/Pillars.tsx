"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BridgePillars } from "@/components/visuals/BridgePillars";
import { pillars } from "@/content/pillars";

export function Pillars() {
  const [activeId, setActiveId] = useState<string>(pillars[0].id);

  return (
    <section id="modelo" className="bg-surface py-20 md:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="El modelo"
            title="Tres pilares sostienen el recorrido."
            description="Cada pilar sostiene un tramo del puente — actívalo para ver qué construye."
          />
        </Reveal>

        <Reveal delay={100} className="mt-10 md:mt-16">
          <BridgePillars items={pillars} activeId={activeId} onSelect={setActiveId} />
        </Reveal>
      </Container>
    </section>
  );
}
