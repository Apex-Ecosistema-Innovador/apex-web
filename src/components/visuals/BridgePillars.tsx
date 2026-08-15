"use client";

import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Pillar } from "@/content/pillars";

interface BridgePillarsProps {
  items: Pillar[];
  activeId: string;
  onSelect: (id: string) => void;
}

type Orientation = "horizontal" | "vertical";
type Point = [number, number];

/**
 * Geometría del puente "de perfil", en dos ejes locales:
 * - "along" (a lo largo del recorrido): inicio → pilares → meta.
 * - "across" (perpendicular al tablero): 0 arriba, crece hacia los pies de
 *   los pilares y su cimentación.
 *
 * En horizontal, along = x y across = y (se lee izquierda→derecha, los
 * pilares cuelgan hacia abajo). En vertical, along = y y across = x (mismo
 * perfil rotado: inicio arriba, meta abajo, pilares hacia la derecha). Toda
 * la geometría se calcula una sola vez y se proyecta según la orientación.
 */
const ALONG_START = 80;
const ALONG_END = 640;
const ALONG_TOTAL = 760;

// Marcadores de inicio/meta: viven AFUERA del tablero, no sobre sus bordes.
// Desplazados en el eje "along" más allá de ALONG_START/ALONG_END lo
// suficiente para que ni su forma (esfera + rayos/trazo) toque el canto del
// puente, con una separación pequeña de por medio. Su etiqueta comparte el
// mismo "along" (queda debajo del marcador, no más lejos en el recorrido) y
// solo se desplaza en "across" — así nunca compite por ancho de lienzo.
const START_MARKER_ALONG = 40;
const GOAL_MARKER_ALONG = 692;
const LABEL_ACROSS_OFFSET = 42;

// Tablero: cara superior (con degradado) + canto inferior (más oscuro, da grosor).
// Grosor pensado para sentirse como una viga real, no una barra delgada.
const ACROSS_DECK = 56;
const DECK_THICKNESS = 24;
const CANTO_THICKNESS = 11;

// Pilar: capitel (une con el tablero) → fuste → cimentación en dos niveles
// (pedestal + zapata) asentada sobre la línea de suelo.
// El capitel arranca EXACTO donde termina el canto (cara inferior del
// tablero) — cero solape geométrico. Antes se dejaba un leve solape hacia
// arriba pensado como "unión", pero los tramos de tablero inactivos se ven a
// 0.45 de opacidad, así que ese solape dejaba asomar el capitel A TRAVÉS del
// tablero. Tocarse justo en el borde evita el problema de raíz, con o sin
// atenuación.
const PILLAR_TOP = ACROSS_DECK + DECK_THICKNESS / 2 + CANTO_THICKNESS;
const CAP_HEIGHT = 16;
const CAP_FLARE = 9;
const PILLAR_HALF = 12;
const PEDESTAL_H = 22;
const PEDESTAL_FLARE = 10;
const FOOTING_H = 14;
const FOOTING_FLARE = 10;
const GROUND_Y = PILLAR_TOP + 150; // altura original del pilar
const FOOTING_TOP = GROUND_Y - FOOTING_H;
const PEDESTAL_TOP = FOOTING_TOP - PEDESTAL_H;
const SHAFT_TOP = PILLAR_TOP + CAP_HEIGHT;

const LABEL_ALLOWANCE = 34;
const ACROSS_TOTAL = GROUND_Y + LABEL_ALLOWANCE + 14;

function proj(orientation: Orientation, along: number, across: number) {
  return orientation === "horizontal" ? { x: along, y: across } : { x: across, y: along };
}

function poly(orientation: Orientation, points: Point[]) {
  return points.map(([along, across]) => {
    const p = proj(orientation, along, across);
    return `${p.x},${p.y}`;
  }).join(" ");
}

function segLen(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Verde claro → amarillo → morado, en ese orden fijo por posición (0..1) —
 *  la misma progresión que usan las etiquetas de pilar, el tablero y las
 *  figuras de inicio/meta, para que toda la composición hable un solo idioma
 *  cromático. `purpleVar` se cambia a la variante accesible para texto. */
function accentAt(position: number, purpleVar: string = "var(--brand-purple)") {
  if (position <= 0.5) {
    const t = position / 0.5;
    return `color-mix(in oklab, var(--brand-green-light), var(--brand-yellow) ${t * 100}%)`;
  }
  const t = (position - 0.5) / 0.5;
  return `color-mix(in oklab, var(--brand-yellow), ${purpleVar} ${t * 100}%)`;
}
const accentTextAt = (position: number) => accentAt(position, "var(--brand-purple-accessible)");
const positionOf = (index: number, total: number) => (total > 1 ? index / (total - 1) : 0);

/** Cimentación → fuste → capitel de un pilar, en puntos locales (along, across). */
function pillarParts(along: number) {
  const h = PILLAR_HALF;
  return {
    cap: [
      [along - h - CAP_FLARE, PILLAR_TOP],
      [along + h + CAP_FLARE, PILLAR_TOP],
      [along + h, PILLAR_TOP + CAP_HEIGHT],
      [along - h, PILLAR_TOP + CAP_HEIGHT],
    ] as Point[],
    shaft: [
      [along - h, SHAFT_TOP],
      [along + h, SHAFT_TOP],
      [along + h, PEDESTAL_TOP],
      [along - h, PEDESTAL_TOP],
    ] as Point[],
    pedestal: [
      [along - h, PEDESTAL_TOP],
      [along + h, PEDESTAL_TOP],
      [along + h + PEDESTAL_FLARE, FOOTING_TOP],
      [along - h - PEDESTAL_FLARE, FOOTING_TOP],
    ] as Point[],
    footing: [
      [along - h - PEDESTAL_FLARE, FOOTING_TOP],
      [along + h + PEDESTAL_FLARE, FOOTING_TOP],
      [along + h + PEDESTAL_FLARE + FOOTING_FLARE, GROUND_Y],
      [along - h - PEDESTAL_FLARE - FOOTING_FLARE, GROUND_Y],
    ] as Point[],
    footingHalfWidth: h + PEDESTAL_FLARE + FOOTING_FLARE,
  };
}

/** Caja de acierto (hit-area) de un pilar, en unidades locales del viewBox. */
function hitBoxAttrs(orientation: Orientation, alongCenter: number, alongHalfSpan: number) {
  const p0 = proj(orientation, alongCenter - alongHalfSpan, 0);
  const p1 = proj(orientation, alongCenter + alongHalfSpan, ACROSS_TOTAL);
  return {
    left: Math.min(p0.x, p1.x),
    top: Math.min(p0.y, p1.y),
    width: Math.abs(p1.x - p0.x),
    height: Math.abs(p1.y - p0.y),
  };
}

// Coreografía de entrada: cimentaciones → pilares suben → tablero se traza
// de extremo a extremo → inicio/meta se encienden. Un solo disparo, a partir
// de "revealed=true"; cada elemento solo necesita su propio delay.
const FOUNDATION_BASE_DELAY = 0;
const FOUNDATION_STAGGER = 90;
const FOUNDATION_DURATION = 380;
const PILLAR_BASE_DELAY = 160;
const PILLAR_STAGGER = 110;
const PILLAR_DURATION = 480;

function DiagramSvg({
  orientation,
  items,
  activeId,
  revealed,
  prefersReducedMotion,
}: {
  orientation: Orientation;
  items: Pillar[];
  activeId: string;
  revealed: boolean;
  prefersReducedMotion: boolean;
}) {
  const n = items.length;
  const step = (ALONG_END - ALONG_START) / (n + 1);
  const alongs = items.map((_, i) => ALONG_START + step * (i + 1));

  const pillarBaseDelayEnd = PILLAR_BASE_DELAY + (n - 1) * PILLAR_STAGGER + PILLAR_DURATION;
  const deckBaseDelay = pillarBaseDelayEnd + 80;
  const deckSegmentDuration = 480;
  const deckSegmentStagger = 190;
  const deckEndDelay = deckBaseDelay + (n - 1) * deckSegmentStagger + deckSegmentDuration;
  const aliveDelay = deckEndDelay + 120;
  const aliveDuration = 420;

  const svgWidth = orientation === "horizontal" ? ALONG_TOTAL : ACROSS_TOTAL;
  const svgHeight = orientation === "horizontal" ? ACROSS_TOTAL : ALONG_TOTAL;
  const gradientId = `bridge-deck-gradient-${orientation}`;
  const shadowFilterId = `bridge-shadow-${orientation}`;

  const deckGradientLine = {
    p0: proj(orientation, ALONG_START, ACROSS_DECK),
    p1: proj(orientation, ALONG_END, ACROSS_DECK),
  };
  const cantoLen = segLen(
    proj(orientation, ALONG_START, 0).x,
    proj(orientation, ALONG_START, 0).y,
    proj(orientation, ALONG_END, 0).x,
    proj(orientation, ALONG_END, 0).y,
  );

  const groundP0 = proj(orientation, ALONG_START - 34, GROUND_Y);
  const groundP1 = proj(orientation, ALONG_END + 34, GROUND_Y);

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const travelerAlong = alongs[activeIndex] ?? alongs[0] ?? ALONG_START;
  const travelerPoint = proj(orientation, travelerAlong, ACROSS_DECK - DECK_THICKNESS / 2 - 18);
  const travelerColor = accentAt(positionOf(Math.max(activeIndex, 0), n));

  // Segmento de tablero que sostiene cada pilar: del punto medio con el
  // vecino anterior al punto medio con el siguiente (los extremos llegan
  // hasta el inicio/meta), así el tablero completo queda repartido sin huecos.
  const segments = alongs.map((along, i) => ({
    id: items[i].id,
    start: i === 0 ? ALONG_START : along - step / 2,
    end: i === n - 1 ? ALONG_END : along + step / 2,
    position: positionOf(i, n),
  }));

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`Puente que representa los ${n} pilares del modelo, conectando el inicio con la meta.`}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={deckGradientLine.p0.x}
          y1={deckGradientLine.p0.y}
          x2={deckGradientLine.p1.x}
          y2={deckGradientLine.p1.y}
        >
          {items.map((item, i) => (
            <stop key={item.id} offset={`${positionOf(i, n) * 100}%`} stopColor={accentAt(positionOf(i, n))} />
          ))}
        </linearGradient>
        <filter id={shadowFilterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Línea de suelo — evita que los pilares floten, les da un horizonte */}
      <line
        x1={groundP0.x}
        y1={groundP0.y}
        x2={groundP1.x}
        y2={groundP1.y}
        stroke="var(--border-default)"
        strokeWidth={1.5}
        style={{
          opacity: revealed ? 0.4 : 0,
          transition: prefersReducedMotion ? undefined : `opacity ${FOUNDATION_DURATION}ms var(--ease-default)`,
        }}
      />

      {/* Cimentaciones: sombra + zapata + pedestal, aparecen primero */}
      {items.map((item, i) => {
        const along = alongs[i];
        const { pedestal, footing, footingHalfWidth } = pillarParts(along);
        const delay = FOUNDATION_BASE_DELAY + i * FOUNDATION_STAGGER;
        const shadowCenter = proj(orientation, along, GROUND_Y + 5);
        const isActive = item.id === activeId;
        // Antes de revelarse: 0 (esperando su turno en el stagger). Ya
        // revelado: 1, o 0.45 si otro pilar está activo. La transición usa el
        // delay escalonado SOLO mientras entra; una vez revelado, el cambio
        // activo/atenuado responde rápido y sin ese delay (si no, atenuar un
        // pilar heredaría el delay de entrada del último en aparecer).
        const restOpacity = !revealed ? 0 : isActive ? 1 : 0.45;
        const entranceTransition = `opacity ${FOUNDATION_DURATION}ms var(--ease-default) ${delay}ms, transform ${FOUNDATION_DURATION}ms var(--ease-default) ${delay}ms`;
        const interactiveTransition = "opacity 220ms var(--ease-default)";

        return (
          <g
            key={item.id}
            style={{
              opacity: restOpacity,
              transform: revealed ? "scale(1)" : "scale(0.85)",
              transformOrigin: `${along}px ${GROUND_Y}px`,
              transition: prefersReducedMotion
                ? "opacity 200ms var(--ease-default)"
                : revealed
                  ? interactiveTransition
                  : entranceTransition,
            }}
          >
            <ellipse
              cx={shadowCenter.x}
              cy={shadowCenter.y}
              rx={footingHalfWidth * (orientation === "horizontal" ? 1.1 : 0.5)}
              ry={orientation === "horizontal" ? 5 : footingHalfWidth * 0.5}
              fill="black"
              opacity={0.3}
              filter={`url(#${shadowFilterId})`}
            />
            <polygon points={poly(orientation, footing)} className="fill-elevated" stroke="var(--border-default)" strokeWidth={1} />
            <polygon points={poly(orientation, pedestal)} className="fill-elevated" stroke="var(--border-default)" strokeWidth={1} />
          </g>
        );
      })}

      {/* Pilares: capitel + fuste, "suben" desde la cimentación */}
      {items.map((item, i) => {
        const along = alongs[i];
        const { cap, shaft } = pillarParts(along);
        const isActive = item.id === activeId;
        const accent = accentAt(positionOf(i, n));
        const delay = PILLAR_BASE_DELAY + i * PILLAR_STAGGER;
        // Desplazamiento de entrada expresado en el eje local "across" (hacia
        // la cimentación) y proyectado: sale "hundido" 22 unidades y sube a su
        // posición final — funciona igual en ambas orientaciones sin duplicar
        // lógica de signos por eje.
        const riseDelta = proj(orientation, 0, 22);
        const entranceTransition = `opacity ${PILLAR_DURATION}ms var(--ease-default) ${delay}ms, transform ${PILLAR_DURATION}ms var(--ease-default) ${delay}ms`;
        const interactiveOpacityTransition = "opacity 220ms var(--ease-default)";

        return (
          <g
            key={item.id}
            style={{
              opacity: isActive ? 1 : 0.45,
              transition: prefersReducedMotion ? "opacity 200ms var(--ease-default)" : interactiveOpacityTransition,
            }}
          >
            <g
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translate(0px, 0px)" : `translate(${riseDelta.x}px, ${riseDelta.y}px)`,
                transition: prefersReducedMotion ? undefined : revealed ? undefined : entranceTransition,
              }}
              className={cn(!prefersReducedMotion && "transition-colors duration-(--duration-fast) ease-default")}
            >
              {/* Siempre en SU color asignado — el sistema cromático debe verse
                  desde el reposo, no solo al activarse. La opacidad del grupo
                  padre (0.45 en reposo, 1 activo) es lo que lo "apaga"/"satura". */}
              <polygon points={poly(orientation, cap)} fill={accent} />
              <polygon points={poly(orientation, shaft)} fill={accent} />
            </g>
          </g>
        );
      })}

      {/* Tablero — canto oscuro continuo (grosor) + cara superior por segmentos,
          cada segmento es el tramo que sostiene un pilar. Se traza de extremo
          a extremo con stroke-dashoffset, en secuencia tras los pilares. */}
      <line
        x1={proj(orientation, ALONG_START, ACROSS_DECK + DECK_THICKNESS / 2 + CANTO_THICKNESS / 2 - 1).x}
        y1={proj(orientation, ALONG_START, ACROSS_DECK + DECK_THICKNESS / 2 + CANTO_THICKNESS / 2 - 1).y}
        x2={proj(orientation, ALONG_END, ACROSS_DECK + DECK_THICKNESS / 2 + CANTO_THICKNESS / 2 - 1).x}
        y2={proj(orientation, ALONG_END, ACROSS_DECK + DECK_THICKNESS / 2 + CANTO_THICKNESS / 2 - 1).y}
        stroke="var(--brand-charcoal)"
        strokeWidth={CANTO_THICKNESS}
        strokeLinecap="square"
        style={{
          strokeDasharray: cantoLen,
          strokeDashoffset: revealed ? 0 : cantoLen,
          transition: prefersReducedMotion
            ? undefined
            : `stroke-dashoffset ${deckEndDelay - deckBaseDelay}ms var(--ease-default) ${deckBaseDelay}ms`,
        }}
      />

      {segments.map((segment, i) => {
        const p0 = proj(orientation, segment.start, ACROSS_DECK);
        const p1 = proj(orientation, segment.end, ACROSS_DECK);
        const len = segLen(p0.x, p0.y, p1.x, p1.y);
        const delay = deckBaseDelay + i * deckSegmentStagger;
        const isActive = segment.id === activeId;
        const solid = accentAt(segment.position);
        // stroke-dashoffset solo se anima una vez (la entrada); opacity se
        // reutiliza después para atenuar/realzar, así que necesita su propia
        // transición corta y SIN el delay escalonado de entrada — igual que
        // en cimentaciones y pilares.
        const entranceTransition = `stroke-dashoffset ${deckSegmentDuration}ms var(--ease-default) ${delay}ms, opacity 200ms var(--ease-default)`;
        const interactiveTransition = "opacity 200ms var(--ease-default)";

        return (
          <g key={segment.id}>
            <line
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke={`url(#${gradientId})`}
              strokeWidth={DECK_THICKNESS}
              strokeLinecap="square"
              style={{
                strokeDasharray: len,
                strokeDashoffset: revealed ? 0 : len,
                opacity: isActive ? 1 : 0.45,
                transition: prefersReducedMotion ? interactiveTransition : revealed ? interactiveTransition : entranceTransition,
              }}
            />
            {/* Realce sólido — "purifica" el tramo a su color exacto cuando su pilar está activo */}
            <line
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke={solid}
              strokeWidth={DECK_THICKNESS}
              strokeLinecap="square"
              style={{
                opacity: isActive ? 1 : 0,
                transition: prefersReducedMotion ? undefined : "opacity 220ms var(--ease-default)",
              }}
            />
          </g>
        );
      })}

      {/* Figura de inicio — nodo sólido + trazo de movimiento hacia el puente,
          posicionada antes de ALONG_START, fuera del tablero */}
      <StartGoalFigure
        kind="start"
        orientation={orientation}
        along={START_MARKER_ALONG}
        color={accentAt(0)}
        revealed={revealed}
        delay={aliveDelay}
        duration={aliveDuration}
        prefersReducedMotion={prefersReducedMotion}
      />
      {/* Figura de meta — halo abierto: sugiere continuidad, no un cierre;
          posicionada después de ALONG_END, fuera del tablero */}
      <StartGoalFigure
        kind="goal"
        orientation={orientation}
        along={GOAL_MARKER_ALONG}
        color={accentAt(1)}
        revealed={revealed}
        delay={aliveDelay}
        duration={aliveDuration}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Figura del estudiante — nodo claro con anillo del color del pilar
          activo, apoyado sobre el tablero. Se desplaza con transform y
          recolorea el anillo al cambiar de pilar; el color no debe heredar
          el delay de entrada (mismo motivo que cimentaciones/pilares/tablero). */}
      <g
        style={{
          transform: `translate(${travelerPoint.x}px, ${travelerPoint.y}px)`,
          opacity: revealed ? 1 : 0,
          transition: prefersReducedMotion
            ? "opacity 200ms var(--ease-default)"
            : revealed
              ? "transform 420ms var(--ease-default)"
              : `transform 420ms var(--ease-default), opacity ${aliveDuration}ms var(--ease-default) ${aliveDelay}ms`,
        }}
      >
        <circle
          r={10.5}
          fill="none"
          stroke={travelerColor}
          strokeWidth={2.5}
          style={{ transition: prefersReducedMotion ? undefined : "stroke 220ms var(--ease-default)" }}
        />
        <circle r={6.5} fill="var(--text-primary)" />
      </g>
    </svg>
  );
}

function StartGoalFigure({
  kind,
  orientation,
  along,
  color,
  revealed,
  delay,
  duration,
  prefersReducedMotion,
}: {
  kind: "start" | "goal";
  orientation: Orientation;
  along: number;
  color: string;
  revealed: boolean;
  delay: number;
  duration: number;
  prefersReducedMotion: boolean;
}) {
  const point = proj(orientation, along, ACROSS_DECK);
  const style = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? "scale(1)" : "scale(0.6)",
    transformOrigin: `${point.x}px ${point.y}px`,
    transition: prefersReducedMotion
      ? undefined
      : `opacity ${duration}ms var(--ease-default) ${delay}ms, transform ${duration}ms var(--ease-default) ${delay}ms`,
  };

  if (kind === "start") {
    const trail = [0, 1, 2].map((i) => {
      const deg = 180 + (i - 1) * 12;
      const rad = (deg * Math.PI) / 180;
      const r0 = 9 + i * 3;
      const r1 = 22 + i * 3;
      const p0 = proj(orientation, along + r0 * Math.cos(rad), ACROSS_DECK + r0 * Math.sin(rad));
      const p1 = proj(orientation, along + r1 * Math.cos(rad), ACROSS_DECK + r1 * Math.sin(rad));
      return { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, opacity: 0.5 - i * 0.15 };
    });
    return (
      <g style={style}>
        {trail.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ opacity: line.opacity }}
          />
        ))}
        {/* Anillo + nodo — mismo lenguaje que la figura del estudiante que se
            desplaza por el tablero, para que el inicio se lea como SU punto
            de partida, no como un adorno aparte. */}
        <circle cx={point.x} cy={point.y} r={13} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={2} />
        <circle cx={point.x} cy={point.y} r={9} fill={color} />
      </g>
    );
  }

  const ringAt = (radius: number) => {
    const pts: string[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const deg = 50 + (260 * i) / steps;
      const rad = (deg * Math.PI) / 180;
      const p = proj(orientation, along + radius * Math.cos(rad), ACROSS_DECK + radius * Math.sin(rad));
      pts.push(`${p.x},${p.y}`);
    }
    return pts.join(" ");
  };
  const rays = [-34, -14, 0, 14, 34].map((deg, i, arr) => {
    const rad = (deg * Math.PI) / 180;
    const p0 = proj(orientation, along + 17 * Math.cos(rad), ACROSS_DECK + 17 * Math.sin(rad));
    const p1 = proj(orientation, along + 40 * Math.cos(rad), ACROSS_DECK + 40 * Math.sin(rad));
    return { x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, opacity: 0.6 - Math.abs(i - (arr.length - 1) / 2) * 0.1 };
  });

  return (
    <g style={style}>
      {/* Doble anillo incompleto + rayos que se abren hacia afuera: sugiere
          apertura y continuidad, no un punto final cerrado. */}
      <polyline points={ringAt(26)} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.3} />
      <polyline points={ringAt(18)} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      {rays.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ opacity: line.opacity }}
        />
      ))}
      <circle cx={point.x} cy={point.y} r={10} fill={color} />
    </g>
  );
}

/**
 * Etiquetas de texto de inicio/meta — capa HTML aparte (control tipográfico
 * real, como los labels de pilar). Comparten el "along" de su marcador
 * (quedan justo debajo de él, ya fuera del tablero) y solo se separan en el
 * eje "across" — en horizontal cae debajo del marcador, en vertical al
 * costado — mismo cálculo para ambas orientaciones.
 */
function EndpointLabels({ orientation }: { orientation: Orientation }) {
  const svgWidth = orientation === "horizontal" ? ALONG_TOTAL : ACROSS_TOTAL;
  const svgHeight = orientation === "horizontal" ? ACROSS_TOTAL : ALONG_TOTAL;
  const startPoint = proj(orientation, START_MARKER_ALONG, ACROSS_DECK + LABEL_ACROSS_OFFSET);
  const goalPoint = proj(orientation, GOAL_MARKER_ALONG, ACROSS_DECK + LABEL_ACROSS_OFFSET);

  return (
    <div className="pointer-events-none absolute inset-0">
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] whitespace-nowrap text-secondary uppercase md:text-[10px]"
        style={{
          left: `${(startPoint.x / svgWidth) * 100}%`,
          top: `${(startPoint.y / svgHeight) * 100}%`,
          letterSpacing: "0.12em",
          color: "var(--brand-green-light)",
        }}
      >
        Inicio
      </span>
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] whitespace-nowrap uppercase md:text-[10px]"
        style={{
          left: `${(goalPoint.x / svgWidth) * 100}%`,
          top: `${(goalPoint.y / svgHeight) * 100}%`,
          letterSpacing: "0.12em",
          color: "var(--brand-purple-accessible)",
        }}
      >
        Sigue adelante
      </span>
    </div>
  );
}

function PillarButtons({
  orientation,
  items,
  activeId,
  onSelect,
  prefersReducedMotion,
}: {
  orientation: Orientation;
  items: Pillar[];
  activeId: string;
  onSelect: (id: string) => void;
  prefersReducedMotion: boolean;
}) {
  const n = items.length;
  const step = (ALONG_END - ALONG_START) / (n + 1);
  const svgWidth = orientation === "horizontal" ? ALONG_TOTAL : ACROSS_TOTAL;
  const svgHeight = orientation === "horizontal" ? ACROSS_TOTAL : ALONG_TOTAL;
  const colorOpacityTransition = prefersReducedMotion ? "" : "transition-[color,opacity] duration-(--duration-fast) ease-default";

  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((item, i) => {
        const along = ALONG_START + step * (i + 1);
        const box = hitBoxAttrs(orientation, along, step * 0.44);
        const isActive = item.id === activeId;
        const accent = accentTextAt(positionOf(i, n));

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isActive}
            aria-describedby={`pillar-desc-${item.id}`}
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => onSelect(item.id)}
            onFocus={() => onSelect(item.id)}
            className={cn(
              "pointer-events-auto absolute flex outline-none",
              "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              orientation === "horizontal" ? "flex-col items-center justify-end pb-1" : "flex-row items-center justify-end pr-1",
            )}
            style={{
              left: `${(box.left / svgWidth) * 100}%`,
              top: `${(box.top / svgHeight) * 100}%`,
              width: `${(box.width / svgWidth) * 100}%`,
              height: `${(box.height / svgHeight) * 100}%`,
            }}
          >
            {/* Etiqueta persistente — siempre en SU color, atenuada en reposo
                (misma lógica que el pilar: un solo color, distinta opacidad) */}
            <span
              className={cn("font-display text-xs font-medium md:text-sm", colorOpacityTransition)}
              style={{ color: accent, opacity: isActive ? 1 : 0.6 }}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Panel flotante por pilar — capa independiente de los botones, para poder
 * anclarse justo junto al TABLERO (no al hitbox completo del pilar, que
 * ocupa todo el alto/ancho del diagrama y haría que el panel "horizontal"
 * viajara hasta chocar con el encabezado de la sección). Solo el pilar
 * activo es visible; el resto queda colapsado (scaleY 0) y sin interacción.
 */
function PillarPanels({
  orientation,
  items,
  activeId,
  prefersReducedMotion,
}: {
  orientation: Orientation;
  items: Pillar[];
  activeId: string;
  prefersReducedMotion: boolean;
}) {
  const n = items.length;
  const step = (ALONG_END - ALONG_START) / (n + 1);
  const svgWidth = orientation === "horizontal" ? ALONG_TOTAL : ACROSS_TOTAL;
  const svgHeight = orientation === "horizontal" ? ACROSS_TOTAL : ALONG_TOTAL;

  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((item, i) => {
        const along = ALONG_START + step * (i + 1);
        const isActive = item.id === activeId;
        const accent = accentTextAt(positionOf(i, n));
        // Horizontal: el panel vive AL COSTADO del fuste, a la altura de su
        // punto medio — nunca por encima del tablero, así jamás alcanza el
        // encabezado de la sección ni tapa la figura del estudiante. Se abre
        // hacia la derecha por defecto; el último pilar lo abre hacia la
        // izquierda para no salirse del área visible cerca de la meta.
        const isLast = i === n - 1;
        const openRight = !isLast;
        const midAcross = (SHAFT_TOP + PEDESTAL_TOP) / 2;
        const anchor = proj(orientation, along, midAcross);
        const anchorLeftPct = (anchor.x / svgWidth) * 100;
        const anchorTopPct = (anchor.y / svgHeight) * 100;

        return (
          <div
            key={item.id}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-30 w-56 rounded-lg border-2 bg-elevated p-2.5 text-left shadow-[0_16px_36px_-14px_rgba(0,0,0,0.65)] md:w-64",
              orientation === "horizontal"
                ? cn("-translate-y-1/2", openRight ? "origin-left" : "origin-right")
                : "left-1/2 w-[85%] max-w-xs -translate-x-1/2 origin-top",
            )}
            style={{
              left: orientation === "horizontal" && openRight ? `${anchorLeftPct}%` : undefined,
              right: orientation === "horizontal" && !openRight ? `${100 - anchorLeftPct}%` : undefined,
              top:
                orientation === "horizontal"
                  ? `${anchorTopPct}%`
                  : `${((along + step * 0.5) / svgHeight) * 100}%`,
              marginLeft: orientation === "horizontal" && openRight ? 16 : undefined,
              marginRight: orientation === "horizontal" && !openRight ? 16 : undefined,
              marginTop: orientation === "vertical" ? 8 : undefined,
              borderColor: accent,
              opacity: isActive ? 1 : 0,
              transform: prefersReducedMotion
                ? undefined
                : isActive
                  ? orientation === "horizontal"
                    ? "scaleX(1)"
                    : "scaleY(1)"
                  : orientation === "horizontal"
                    ? "scaleX(0)"
                    : "scaleY(0)",
              transition: prefersReducedMotion
                ? "opacity 160ms var(--ease-default)"
                : `transform ${isActive ? 240 : 190}ms var(--ease-default), opacity ${isActive ? 200 : 140}ms var(--ease-default)`,
            }}
          >
            <div
              className="flex flex-col gap-1.5"
              style={{
                opacity: isActive ? 1 : 0,
                transition: prefersReducedMotion ? undefined : `opacity 160ms var(--ease-default) ${isActive ? 90 : 0}ms`,
              }}
            >
              {/* Sin el nombre aquí: ya lo muestra la etiqueta persistente
                  junto al pilar, justo debajo — repetirlo sería redundante
                  con ambos visibles a la vez. La bajada hace de titular. */}
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: accent }}>
                  {String(i + 1).padStart(2, "0")} · Pilar
                </span>
                <p className="font-display text-sm leading-snug font-medium md:text-base" style={{ color: accent }}>
                  {item.tagline}
                </p>
              </div>
              <p className="font-body text-xs leading-snug text-secondary">{item.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.concepts.map((concept, ci) => (
                  <span
                    key={concept}
                    className="rounded-md border border-subtle bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-secondary"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(4px)",
                      transition: prefersReducedMotion
                        ? undefined
                        : `opacity 200ms var(--ease-default) ${140 + ci * 60}ms, transform 200ms var(--ease-default) ${140 + ci * 60}ms`,
                    }}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BridgePillars({ items, activeId, onSelect }: BridgePillarsProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const prefersReducedMotion = useReducedMotion();
  const revealed = prefersReducedMotion || isInView;

  function renderVariant(orientation: Orientation) {
    return (
      <div
        className={cn("relative w-full", orientation === "horizontal" ? "hidden md:block" : "block md:hidden")}
      >
        <DiagramSvg
          orientation={orientation}
          items={items}
          activeId={activeId}
          revealed={revealed}
          prefersReducedMotion={prefersReducedMotion}
        />
        <PillarButtons
          orientation={orientation}
          items={items}
          activeId={activeId}
          onSelect={onSelect}
          prefersReducedMotion={prefersReducedMotion}
        />
        <PillarPanels
          orientation={orientation}
          items={items}
          activeId={activeId}
          prefersReducedMotion={prefersReducedMotion}
        />
        <EndpointLabels orientation={orientation} />
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full">
      {renderVariant("horizontal")}
      {renderVariant("vertical")}

      {/* Descripciones accesibles, siempre presentes para lectores de pantalla */}
      {items.map((item) => (
        <span key={item.id} id={`pillar-desc-${item.id}`} className="sr-only">
          {item.tagline} {item.description}
        </span>
      ))}
    </div>
  );
}
