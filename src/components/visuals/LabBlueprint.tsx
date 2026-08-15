
"use client";

import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface LabZone {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Plano del futuro espacio de aprendizaje, en un sistema de 3 "columnas"
 * (estaciones | colaboración+arena | concentración+mentoría) separadas por
 * pasillos de 20 unidades. La Challenge arena queda en el centro, como
 * corazón del plano. viewBox: 0 0 800 520.
 */
export const labZones: LabZone[] = [
  {
    id: "estaciones",
    name: "Estaciones de programación",
    description: "Puestos con doble monitor para práctica individual y refuerzo.",
    x: 40,
    y: 40,
    w: 220,
    h: 440,
  },
  {
    id: "colaboracion",
    name: "Zona de colaboración",
    description: "Mesas reconfigurables para trabajo en equipo y resolución conjunta.",
    x: 280,
    y: 40,
    w: 280,
    h: 180,
  },
  {
    id: "arena",
    name: "Challenge arena",
    description: "Espacio central para hackathons, retos y competencia formativa.",
    x: 280,
    y: 240,
    w: 280,
    h: 240,
  },
  {
    id: "concentracion",
    name: "Espacios de concentración",
    description: "Cabinas para trabajo enfocado sin distracción.",
    x: 580,
    y: 40,
    w: 180,
    h: 180,
  },
  {
    id: "mentoria",
    name: "Zona de mentoría y descanso",
    description: "Punto de acompañamiento y retroalimentación compartido con un espacio donde el estudiante puede parar las actividades de programacion y disfrutar de muebles tipo puffs, mesas de PingPong y maquinas de Snacks.",
    x: 580,
    y: 240,
    w: 180,
    h: 240,
  },
];

const BOUNDARY = { x: 20, y: 20, w: 760, h: 480 };
const VIEW_W = 800;
const VIEW_H = 520;

// Pasillos de circulación entre zonas — el corazón (arena) conecta con las
// otras cuatro. Cada uno es un segmento corto y recto que cruza exactamente
// un pasillo, así que su longitud ya se conoce sin medir nada.
const connectors = [
  { id: "c-estaciones", fromId: "estaciones", toId: "arena", x1: 260, y1: 360, x2: 280, y2: 360 },
  { id: "c-colaboracion", fromId: "colaboracion", toId: "arena", x1: 420, y1: 220, x2: 420, y2: 240 },
  { id: "c-mentoria", fromId: "arena", toId: "mentoria", x1: 560, y1: 360, x2: 580, y2: 360 },
  { id: "c-concentracion", fromId: "mentoria", toId: "concentracion", x1: 670, y1: 220, x2: 670, y2: 240 },
];

function center(zone: LabZone) {
  return { cx: zone.x + zone.w / 2, cy: zone.y + zone.h / 2 };
}

function rectPerimeter(w: number, h: number) {
  return 2 * (w + h);
}

function segmentLength(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Verde claro → amarillo — el morado ya es el tono de reposo de todo el plano. */
function accentColorAt(position: number) {
  return `color-mix(in oklab, var(--brand-green-light), var(--brand-yellow) ${position * 100}%)`;
}

// Coreografía de entrada: cuadrícula → contorno → zonas → pasillos → "cobra
// vida" (íconos + etiquetas) → barrido de luz. Todo se dispara una sola vez,
// a partir del mismo instante (revealed=true); cada elemento solo necesita
// su propio delay para quedar en secuencia.
const GRID_DURATION = 500;
const BOUNDARY_DELAY = 150;
const BOUNDARY_DURATION = 600;
const ZONE_BASE_DELAY = 380;
const ZONE_STAGGER = 100;
const ZONE_DURATION = 550;
const CONNECTOR_BASE_DELAY = ZONE_BASE_DELAY + labZones.length * ZONE_STAGGER + 60;
const CONNECTOR_STAGGER = 60;
const CONNECTOR_DURATION = 320;
const ALIVE_DELAY =
  CONNECTOR_BASE_DELAY + connectors.length * CONNECTOR_STAGGER + CONNECTOR_DURATION + 150;
const ICON_STAGGER = 90;
const ICON_DURATION = 450;
const SWEEP_DELAY = ALIVE_DELAY + 350;
const SWEEP_DURATION = 1500;

function ZoneIcon({ id }: { id: string }) {
  switch (id) {
    case "estaciones":
      return (
        <>
          <rect x={-32} y={6} width={64} height={8} fill="currentColor" />
          <rect x={-26} y={-14} width={22} height={16} fill="none" stroke="currentColor" strokeWidth={2} />
          <rect x={4} y={-14} width={22} height={16} fill="none" stroke="currentColor" strokeWidth={2} />
        </>
      );
    case "colaboracion":
      return (
        <>
          <circle cx={-16} cy={-8} r={11} fill="none" stroke="currentColor" strokeWidth={2} />
          <circle cx={16} cy={-6} r={11} fill="none" stroke="currentColor" strokeWidth={2} />
          <circle cx={0} cy={16} r={11} fill="none" stroke="currentColor" strokeWidth={2} />
        </>
      );
    case "arena":
      return (
        <>
          <circle cx={0} cy={0} r={36} fill="none" stroke="currentColor" strokeWidth={2} strokeOpacity={0.6} />
          <circle cx={0} cy={0} r={14} fill="currentColor" />
          {[45, 135, 225, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={40 * Math.cos(rad)}
                y1={40 * Math.sin(rad)}
                x2={52 * Math.cos(rad)}
                y2={52 * Math.sin(rad)}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
        </>
      );
    case "concentracion":
      return (
        <>
          <rect x={-40} y={-8} width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} />
          <rect x={-8} y={-8} width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} />
          <rect x={24} y={-8} width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} />
        </>
      );
    case "mentoria":
      return (
        <>
          <line x1={0} y1={0} x2={-24} y2={-16} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.6} />
          <line x1={0} y1={0} x2={22} y2={-10} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.6} />
          <circle cx={0} cy={0} r={11} fill="currentColor" />
          <circle cx={-24} cy={-16} r={5} fill="currentColor" fillOpacity={0.7} />
          <circle cx={22} cy={-10} r={5} fill="currentColor" fillOpacity={0.7} />
        </>
      );
    default:
      return null;
  }
}

interface LabBlueprintProps {
  activeId: string | null;
  onActivate: (id: string | null) => void;
  className?: string;
}

export function LabBlueprint({ activeId, onActivate, className }: LabBlueprintProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const revealed = prefersReducedMotion || isInView;

  const fastColorTransition = prefersReducedMotion ? "" : "transition-colors duration-(--duration-fast) ease-default";

  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)}>
      {/* Cuadrícula técnica */}
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full" role="img" aria-label="Plano conceptual del futuro espacio de aprendizaje, dividido en cinco zonas.">
        <defs>
          <pattern id="lab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--brand-purple)"
              strokeOpacity={0.16}
              strokeWidth={1}
            />
          </pattern>
        </defs>

        <rect
          x={0}
          y={0}
          width={VIEW_W}
          height={VIEW_H}
          fill="url(#lab-grid)"
          style={{
            opacity: revealed ? 1 : 0,
            transition: prefersReducedMotion ? undefined : `opacity ${GRID_DURATION}ms var(--ease-default)`,
          }}
        />

        {/* Contorno del edificio */}
        <rect
          x={BOUNDARY.x}
          y={BOUNDARY.y}
          width={BOUNDARY.w}
          height={BOUNDARY.h}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={2}
          style={{
            strokeDasharray: rectPerimeter(BOUNDARY.w, BOUNDARY.h),
            strokeDashoffset: revealed ? 0 : rectPerimeter(BOUNDARY.w, BOUNDARY.h),
            transition: prefersReducedMotion
              ? undefined
              : `stroke-dashoffset ${BOUNDARY_DURATION}ms var(--ease-default) ${BOUNDARY_DELAY}ms`,
          }}
        />

        {/* Pasillos de circulación — acento morado */}
        {connectors.map((c, i) => {
          const isNearActive = activeId === c.fromId || activeId === c.toId;
          const length = segmentLength(c.x1, c.y1, c.x2, c.y2);
          const delay = CONNECTOR_BASE_DELAY + i * CONNECTOR_STAGGER;
          return (
            <line
              key={c.id}
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke="var(--brand-purple)"
              strokeWidth={isNearActive ? 3 : 2}
              strokeOpacity={isNearActive ? 0.9 : 0.45}
              style={{
                strokeDasharray: length,
                strokeDashoffset: revealed ? 0 : length,
                transition: prefersReducedMotion
                  ? "stroke-opacity 150ms var(--ease-default), stroke-width 150ms var(--ease-default)"
                  : `stroke-dashoffset ${CONNECTOR_DURATION}ms var(--ease-default) ${delay}ms, stroke-opacity 150ms var(--ease-default), stroke-width 150ms var(--ease-default)`,
              }}
            />
          );
        })}

        {/* Zonas */}
        {labZones.map((zone, index) => {
          const isActive = activeId === zone.id;
          const isDimmed = activeId !== null && !isActive;
          const position = labZones.length > 1 ? index / (labZones.length - 1) : 0;
          const accent = accentColorAt(position);
          const perimeter = rectPerimeter(zone.w, zone.h);
          const drawDelay = ZONE_BASE_DELAY + index * ZONE_STAGGER;
          const iconDelay = ALIVE_DELAY + index * ICON_STAGGER;
          const { cx, cy } = center(zone);

          return (
            <g
              key={zone.id}
              style={{
                opacity: isDimmed ? 0.45 : 1,
                transition: prefersReducedMotion ? undefined : "opacity 200ms var(--ease-default)",
              }}
            >
              {/* Contorno de la zona (se traza solo) */}
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                fill="none"
                stroke={isActive ? accent : "var(--brand-purple)"}
                strokeOpacity={isActive ? 1 : 0.55}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{
                  strokeDasharray: perimeter,
                  strokeDashoffset: revealed ? 0 : perimeter,
                  transition: prefersReducedMotion
                    ? "stroke 150ms var(--ease-default), stroke-opacity 150ms var(--ease-default), stroke-width 150ms var(--ease-default)"
                    : `stroke-dashoffset ${ZONE_DURATION}ms var(--ease-default) ${drawDelay}ms, stroke 150ms var(--ease-default), stroke-opacity 150ms var(--ease-default), stroke-width 150ms var(--ease-default)`,
                }}
              />

              {/* Relleno de iluminación al activarse */}
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                fill={accent}
                style={{
                  opacity: isActive ? 0.14 : 0,
                  transition: prefersReducedMotion ? undefined : "opacity 200ms var(--ease-default)",
                }}
              />

              {/* Ícono de la zona — entra al "cobrar vida" */}
              <g
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: revealed ? "scale(1)" : "scale(0.9)",
                  opacity: revealed ? 1 : 0,
                  transition: prefersReducedMotion
                    ? undefined
                    : `transform ${ICON_DURATION}ms var(--ease-default) ${iconDelay}ms, opacity ${ICON_DURATION}ms var(--ease-default) ${iconDelay}ms`,
                }}
              >
                <g
                  transform={`translate(${cx} ${cy})`}
                  className={fastColorTransition}
                  style={{ color: isActive ? accent : "var(--text-muted)" }}
                >
                  <ZoneIcon id={zone.id} />
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Barrido de luz — un único recorrido, no en loop */}
      {!prefersReducedMotion ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-2/5"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at center, color-mix(in oklab, var(--brand-purple) 30%, transparent), transparent 72%)",
            transform: revealed ? "translateX(320%)" : "translateX(-120%)",
            transition: `transform ${SWEEP_DURATION}ms var(--ease-default) ${SWEEP_DELAY}ms`,
          }}
        />
      ) : null}

      {/* Overlay accesible: un <button> real por zona, superpuesto sobre el SVG — solo desktop */}
      <div className="absolute inset-0 hidden md:block">
        {labZones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            aria-label={zone.name}
            aria-describedby={`lab-zone-desc-${zone.id}`}
            onMouseEnter={() => onActivate(zone.id)}
            onMouseLeave={() => onActivate(null)}
            onFocus={() => onActivate(zone.id)}
            onBlur={() => onActivate(null)}
            className="absolute outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{
              left: `${(zone.x / VIEW_W) * 100}%`,
              top: `${(zone.y / VIEW_H) * 100}%`,
              width: `${(zone.w / VIEW_W) * 100}%`,
              height: `${(zone.h / VIEW_H) * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Persianas por zona — la información se despliega DENTRO de cada zona
          (no en un panel aparte), en HTML superpuesto para tener control
          tipográfico real. Visible en ambos breakpoints: en desktop la
          disparan los hotspots de arriba; en móvil, la lista de FutureLab. */}
      <div className="pointer-events-none absolute inset-0">
        {labZones.map((zone, index) => {
          const isActive = activeId === zone.id;
          const position = labZones.length > 1 ? index / (labZones.length - 1) : 0;
          const accent = accentColorAt(position);
          // Las zonas de la columna derecha anclan el panel a su borde
          // derecho, para que si crece más allá de su propio ancho (en
          // pantallas angostas) lo haga hacia la izquierda, no fuera del plano.
          const anchorsRight = zone.x >= 580;
          const transformTransition = prefersReducedMotion
            ? undefined
            : `transform ${isActive ? 240 : 190}ms var(--ease-default), opacity ${isActive ? 200 : 140}ms var(--ease-default)`;
          const contentTransition = prefersReducedMotion
            ? undefined
            : `opacity 160ms var(--ease-default) ${isActive ? 80 : 0}ms`;

          return (
            <div
              key={zone.id}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute min-h-[92px] min-w-[168px] origin-top rounded-md border-2 bg-elevated/95 p-3 md:min-h-0 md:min-w-0",
              )}
              style={{
                left: anchorsRight ? undefined : `${(zone.x / VIEW_W) * 100}%`,
                right: anchorsRight ? `${100 - ((zone.x + zone.w) / VIEW_W) * 100}%` : undefined,
                top: `${(zone.y / VIEW_H) * 100}%`,
                width: `${(zone.w / VIEW_W) * 100}%`,
                minHeight: `${(zone.h / VIEW_H) * 100}%`,
                borderColor: accent,
                transform: prefersReducedMotion ? undefined : isActive ? "scaleY(1)" : "scaleY(0)",
                opacity: isActive ? 1 : 0,
                transition: transformTransition,
              }}
            >
              <div
                className="flex h-full flex-col gap-1"
                style={{ opacity: isActive ? 1 : 0, transition: contentTransition }}
              >
                <span className="font-mono text-xs uppercase tracking-wide" style={{ color: accent }}>
                  {String(index + 1).padStart(2, "0")} · Zona
                </span>
                <h4 className="font-display text-base leading-tight font-medium text-primary md:text-lg">
                  {zone.name}
                </h4>
                <p className="font-body text-sm leading-snug text-secondary">{zone.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Descripciones accesibles, siempre presentes para lectores de pantalla */}
      {labZones.map((zone) => (
        <span key={zone.id} id={`lab-zone-desc-${zone.id}`} className="sr-only">
          {zone.description}
        </span>
      ))}
    </div>
  );
}

export function getLabZoneAccent(zoneId: string | null): string | undefined {
  if (!zoneId) return undefined;
  const index = labZones.findIndex((z) => z.id === zoneId);
  if (index === -1) return undefined;
  const position = labZones.length > 1 ? index / (labZones.length - 1) : 0;
  return accentColorAt(position);
}
