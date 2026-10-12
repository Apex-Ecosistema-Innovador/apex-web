import type { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/components/layout/Container";
import { Aviso } from "@/components/hackathon/Aviso";
import { HackathonShell } from "@/components/hackathon/HackathonShell";
import { InscripcionForm } from "@/components/hackathon/InscripcionForm";
import { Badge } from "@/components/ui/Badge";
import { etiquetasFase } from "@/content/hackathon/fases";
import { eventoConfigurado, obtenerEvento } from "@/lib/hackathon/api";
import type { EventoPublico } from "@/lib/hackathon/tipos";

export const metadata: Metadata = {
  title: "Inscripción a la hackathon · APEX",
  description: "Inscríbete a la hackathon de APEX: una competencia formativa para resolver retos en equipo.",
};

type Carga =
  | { tipo: "sin-configurar" }
  | { tipo: "no-disponible" }
  | { tipo: "error" }
  | { tipo: "evento"; evento: EventoPublico };

async function cargarEvento(): Promise<Carga> {
  const eventoId = eventoConfigurado();
  if (!eventoId) return { tipo: "sin-configurar" };
  try {
    const evento = await obtenerEvento(eventoId);
    return evento ? { tipo: "evento", evento } : { tipo: "no-disponible" };
  } catch {
    return { tipo: "error" };
  }
}

function Contenido({ carga }: { carga: Carga }) {
  if (carga.tipo === "sin-configurar") {
    return <Aviso tono="info">La inscripción todavía no está configurada para este sitio.</Aviso>;
  }
  if (carga.tipo === "no-disponible") {
    return <Aviso tono="info">Esta hackathon no está disponible por ahora. Vuelve a consultar pronto.</Aviso>;
  }
  if (carga.tipo === "error") {
    return (
      <Aviso tono="error">
        No pudimos cargar la información de la hackathon. Recarga la página en unos minutos.
      </Aviso>
    );
  }
  if (!carga.evento.inscripcionesAbiertas) {
    return (
      <Aviso tono="info">
        Las inscripciones no están abiertas en este momento. Estado del evento: {etiquetasFase[carga.evento.faseActual]}.
      </Aviso>
    );
  }
  return <InscripcionForm evento={carga.evento} />;
}

export default async function PaginaInscripcion() {
  await connection();
  const carga = await cargarEvento();
  const evento = carga.tipo === "evento" ? carga.evento : null;

  return (
    <HackathonShell>
      <Container>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <header className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-accent md:text-sm">
              Hackathon · Inscripciones
            </p>
            <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">
              {evento ? evento.nombre : "Hackathon APEX"}
            </h1>
            <p className="font-body text-lg text-secondary md:text-xl">
              {evento?.descripcion || "Competir también puede ser una forma de aprender."}
            </p>
            {evento ? (
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Badge>{etiquetasFase[evento.faseActual]}</Badge>
                </li>
                <li>
                  <Badge>{evento.modalidad}</Badge>
                </li>
                {evento.lugar ? (
                  <li>
                    <Badge>{evento.lugar}</Badge>
                  </li>
                ) : null}
                <li>
                  <Badge>
                    Equipos de {evento.equipoMin} a {evento.equipoMax}
                  </Badge>
                </li>
              </ul>
            ) : null}
          </header>
          <Contenido carga={carga} />
        </div>
      </Container>
    </HackathonShell>
  );
}
