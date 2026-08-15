"use client";

import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { team, type TeamMember } from "@/content/team";

/** Se reparte por índice global (no por grupo) para que dos cards vecinas en
 *  el grid casi nunca compartan tono, incluso a través del salto entre
 *  "Equipo de investigación" y "Estudiantes investigadores". */
const ACCENT_CYCLE = ["var(--brand-green-light)", "var(--brand-yellow)", "var(--brand-purple)"] as const;
function accentForIndex(index: number) {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length];
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Marcas de esquina tipo visor de cámara — leen como "aquí va una foto", no como decoración suelta. */
function ViewfinderCorners() {
  const base = "absolute h-3 w-3 border-brand-purple-accessible/40";
  return (
    <>
      <span aria-hidden="true" className={cn(base, "top-2 left-2 border-t border-l")} />
      <span aria-hidden="true" className={cn(base, "top-2 right-2 border-t border-r")} />
      <span aria-hidden="true" className={cn(base, "bottom-2 left-2 border-b border-l")} />
      <span aria-hidden="true" className={cn(base, "bottom-2 right-2 border-b border-r")} />
    </>
  );
}

function TeamCard({
  member,
  accent,
  reducedMotion,
  className,
}: {
  member: TeamMember;
  accent: string;
  reducedMotion: boolean;
  className?: string;
}) {
  return (
    <div
      tabIndex={0}
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-subtle bg-elevated/40 p-4 outline-none",
        reducedMotion
          ? "hover:border-brand-purple-accessible focus-visible:border-brand-purple-accessible"
          : cn(
              "transition-[border-color,translate] duration-(--duration-fast) ease-default",
              "hover:-translate-y-1 hover:border-brand-purple-accessible",
              "focus-visible:-translate-y-1 focus-visible:border-brand-purple-accessible",
            ),
        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {/* Identidad propia de la card — muy tenue, ancla arriba (lado de la
          foto) para no interferir con el contraste de nombre/rol abajo. El
          fondo elevado (#3a3a3a) es más claro que el canvas del resto del
          sitio, así que el mismo % de color-mix se ve bastante más fuerte
          aquí — se usan valores mucho más bajos que en otras secciones. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 45% at 50% -10%, color-mix(in oklab, ${accent} 5%, transparent) 0%, transparent 55%)`,
        }}
      />
      {/* Se intensifica ligeramente con el mismo feedback de hover/foco que ya existe */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0",
          !reducedMotion && "transition-opacity duration-(--duration-base) ease-default",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
        style={{
          background: `radial-gradient(ellipse 90% 45% at 50% -10%, color-mix(in oklab, ${accent} 8%, transparent) 0%, transparent 55%)`,
        }}
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-subtle bg-elevated">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className={cn(
              "object-cover",
              reducedMotion
                ? ""
                : "transition-transform duration-(--duration-base) ease-default group-hover:scale-105 group-focus-visible:scale-105",
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* El tono de la card también integra el placeholder — deja de
                sentirse como un rectángulo gris vacío, sin volverse un
                bloque de color sobre el gris elevado. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 55% at 20% 0%, color-mix(in oklab, ${accent} 9%, transparent) 0%, transparent 60%)`,
              }}
            />
            <ViewfinderCorners />
            <span className="relative font-mono text-2xl tracking-wide text-secondary">
              {initialsOf(member.name)}
            </span>
          </div>
        )}
      </div>

      <div className="relative flex flex-col gap-1">
        <p className="font-display text-base font-medium text-primary">{member.name}</p>
        <p className="font-body text-sm text-secondary">{member.role}</p>
      </div>
    </div>
  );
}

function TeamGroup({
  title,
  members,
  reducedMotion,
  cardBasisClassName,
  revealBaseDelay,
}: {
  title: string;
  members: { member: TeamMember; globalIndex: number }[];
  reducedMotion: boolean;
  cardBasisClassName: string;
  revealBaseDelay: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-mono text-xs tracking-widest text-secondary uppercase md:text-sm">
        {title}
      </h3>
      <ul className="flex flex-wrap justify-center gap-6">
        {members.map(({ member, globalIndex }, index) => (
          <Reveal
            key={member.id}
            delay={revealBaseDelay + index * 60}
            className={cardBasisClassName}
          >
            <li className="list-none">
              <TeamCard member={member} accent={accentForIndex(globalIndex)} reducedMotion={reducedMotion} />
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export function Team() {
  const reducedMotion = useReducedMotion();
  const indexed = team.map((member, globalIndex) => ({ member, globalIndex }));
  const investigacion = indexed.filter((entry) => entry.member.group === "investigacion");
  const estudiantes = indexed.filter((entry) => entry.member.group === "estudiantes");

  return (
    <section id="equipo" className="bg-canvas py-20 md:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="El equipo"
            title="Quiénes están detrás de APEX."
            description="Un equipo del Grupo de Investigación en Ingeniería Sostenible (GIS) y el Semillero de Investigación en Inteligencia Artificial (SIIC)."
          />
        </Reveal>

        <div className="mt-4 flex flex-col gap-16">
          <TeamGroup
            title="Equipo de investigación"
            members={investigacion}
            reducedMotion={reducedMotion}
            cardBasisClassName="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            revealBaseDelay={80}
          />
          <TeamGroup
            title="Estudiantes investigadores"
            members={estudiantes}
            reducedMotion={reducedMotion}
            cardBasisClassName="w-full sm:w-[calc(50%-0.75rem)] sm:max-w-sm"
            revealBaseDelay={80}
          />
        </div>
      </Container>
    </section>
  );
}
