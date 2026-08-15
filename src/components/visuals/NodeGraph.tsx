"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Composición abstracta de nodos conectados que evoca el recorrido
 * problema → lógica → algoritmo → código. Decorativa (aria-hidden): el
 * significado ya está cubierto por el copy del Hero.
 *
 * Se construye en secuencia narrativa al montar (nodo → línea → nodo…) y
 * reacciona muy sutilmente al cursor (parallax por capas). Ambos
 * comportamientos respetan prefers-reduced-motion: el grafo aparece completo
 * y estático, sin construcción ni parallax.
 */

interface GraphNode {
  id: string;
  cx: number;
  cy: number;
  r: number;
  label: string;
  labelX: number;
  labelY: number;
  fill: string;
  labelClass: string;
  parallaxShift: number;
  delay: number;
}

const MAIN_NODES: GraphNode[] = [
  {
    id: "problema",
    cx: 70,
    cy: 80,
    r: 20,
    label: "PROBLEMA",
    labelX: 70,
    labelY: 118,
    fill: "var(--brand-green-pine)",
    labelClass: "fill-secondary",
    parallaxShift: 7,
    delay: 0,
  },
  {
    id: "logica",
    cx: 165,
    cy: 155,
    r: 26,
    label: "LÓGICA",
    labelX: 165,
    labelY: 197,
    fill: "var(--brand-green-pine)",
    labelClass: "fill-secondary",
    parallaxShift: 4,
    delay: 360,
  },
  {
    id: "algoritmo",
    cx: 255,
    cy: 235,
    r: 22,
    label: "ALGORITMO",
    labelX: 255,
    labelY: 273,
    fill: "var(--brand-green-pine)",
    labelClass: "fill-secondary",
    parallaxShift: 6,
    delay: 720,
  },
  {
    id: "codigo",
    cx: 335,
    cy: 320,
    r: 24,
    label: "CÓDIGO",
    labelX: 335,
    labelY: 360,
    fill: "var(--brand-green-light)",
    labelClass: "fill-primary",
    parallaxShift: 5,
    delay: 1080,
  },
];

const NODE_DURATION = 320;
const LABEL_DURATION = 260;
const LABEL_DELAY_OFFSET = 70;
const LINE_DURATION = 260;

// Solo el último tramo (algoritmo → código) lleva morado — un degradado que
// se insinúa justo antes de llegar al destino, sin competir con el verde que
// domina el resto del recorrido.
const SEGMENTS = [
  { id: "seg-0", from: MAIN_NODES[0], to: MAIN_NODES[1], delay: 120, stroke: "var(--brand-green-pine)", strokeOpacity: 0.55 },
  { id: "seg-1", from: MAIN_NODES[1], to: MAIN_NODES[2], delay: 480, stroke: "var(--brand-green-pine)", strokeOpacity: 0.55 },
  { id: "seg-2", from: MAIN_NODES[2], to: MAIN_NODES[3], delay: 840, stroke: "url(#nodegraph-spine-accent)", strokeOpacity: 0.78 },
];

interface SatelliteNode {
  id: string;
  from: GraphNode;
  cx: number;
  cy: number;
  r: number;
  stroke: string;
  fill: string;
  strokeOpacity: number;
  fillOpacity: number;
  delay: number;
  parallaxShift: number;
}

const SATELLITES: SatelliteNode[] = [
  {
    id: "sat-yellow",
    from: MAIN_NODES[1],
    cx: 112,
    cy: 102,
    r: 6,
    stroke: "var(--brand-yellow)",
    fill: "var(--brand-yellow)",
    strokeOpacity: 0.6,
    fillOpacity: 1,
    delay: 1120,
    parallaxShift: 13,
  },
  {
    id: "sat-green-light",
    from: MAIN_NODES[2],
    cx: 308,
    cy: 188,
    r: 6,
    stroke: "var(--brand-green-light)",
    fill: "var(--brand-green-light)",
    strokeOpacity: 0.6,
    fillOpacity: 1,
    delay: 1200,
    parallaxShift: 12,
  },
  // Antes verde-pino tenue; ahora morado — el punto donde el grafo deja
  // entrar el tercer color de marca, en su rol de detalle, no de protagonista.
  {
    id: "sat-purple",
    from: MAIN_NODES[0],
    cx: 30,
    cy: 128,
    r: 5,
    stroke: "var(--brand-purple)",
    fill: "var(--brand-purple)",
    strokeOpacity: 0.45,
    fillOpacity: 0.85,
    delay: 1280,
    parallaxShift: 14,
  },
];
const SATELLITE_DURATION = 240;

const CODE_PULSE_DELAY = MAIN_NODES[3].delay + NODE_DURATION;
const CODE_PULSE_DURATION = 560;

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

const PARALLAX_LAYERS: { id: string; parallaxShift: number }[] = [...MAIN_NODES, ...SATELLITES];

export function NodeGraph() {
  const prefersReducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const parallaxNodes = useRef(new Map<string, SVGGElement | null>());

  useEffect(() => {
    if (prefersReducedMotion) return;
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  // Parallax por cursor: solo en punteros finos (mouse), nunca en táctil, y
  // nunca con reduced-motion. Actualiza `transform` directamente por
  // elemento (sin pasar por React) en un rAF por frame como mucho, y deja que
  // la transición CSS declarada en `parallaxStyle` suavice el recorrido —
  // así no hace falta un bucle de easing manual.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasFinePointer) return;

    const svg = svgRef.current;
    if (!svg) return;

    let rect = svg.getBoundingClientRect();
    let ticking = false;
    let targetX = 0;
    let targetY = 0;

    function updateRect() {
      rect = svg!.getBoundingClientRect();
    }

    function applyTransforms() {
      for (const layer of PARALLAX_LAYERS) {
        const el = parallaxNodes.current.get(layer.id);
        if (!el) continue;
        const x = (targetX * layer.parallaxShift).toFixed(2);
        const y = (targetY * layer.parallaxShift).toFixed(2);
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      ticking = false;
    }

    function schedule() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyTransforms);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfW = rect.width / 2 || 1;
      const halfH = rect.height / 2 || 1;
      targetX = Math.max(-1, Math.min(1, (event.clientX - cx) / halfW));
      targetY = Math.max(-1, Math.min(1, (event.clientY - cy) / halfH));
      schedule();
    }

    function resetTransforms() {
      targetX = 0;
      targetY = 0;
      schedule();
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", updateRect);
    window.addEventListener("blur", resetTransforms);
    document.addEventListener("pointerleave", resetTransforms);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("blur", resetTransforms);
      document.removeEventListener("pointerleave", resetTransforms);
    };
  }, [prefersReducedMotion]);

  const revealed = prefersReducedMotion || started;

  const parallaxStyle: CSSProperties = prefersReducedMotion
    ? {}
    : { transform: "translate(0px, 0px)", transition: "transform 320ms var(--ease-default)" };

  function registerParallax(id: string) {
    return (el: SVGGElement | null) => {
      parallaxNodes.current.set(id, el);
    };
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      className="h-auto w-full max-w-xs md:max-w-md"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="nodegraph-spine-accent"
          gradientUnits="userSpaceOnUse"
          x1={MAIN_NODES[2].cx}
          y1={MAIN_NODES[2].cy}
          x2={MAIN_NODES[3].cx}
          y2={MAIN_NODES[3].cy}
        >
          <stop offset="0%" stopColor="var(--brand-green-pine)" />
          <stop offset="55%" stopColor="color-mix(in oklab, var(--brand-green-pine) 45%, var(--brand-purple) 55%)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--brand-purple) 88%, var(--brand-green-pine) 12%)" />
        </linearGradient>
      </defs>

      {/* Camino principal — se traza en secuencia narrativa conforme avanza
          la construcción del grafo, no aparece de golpe */}
      {SEGMENTS.map((segment) => {
        const len = dist(segment.from.cx, segment.from.cy, segment.to.cx, segment.to.cy);
        return (
          <line
            key={segment.id}
            x1={segment.from.cx}
            y1={segment.from.cy}
            x2={segment.to.cx}
            y2={segment.to.cy}
            stroke={segment.stroke}
            strokeWidth={2}
            strokeOpacity={segment.strokeOpacity}
            style={{
              strokeDasharray: len,
              strokeDashoffset: revealed ? 0 : len,
              transition: prefersReducedMotion
                ? undefined
                : `stroke-dashoffset ${LINE_DURATION}ms var(--ease-default) ${segment.delay}ms`,
            }}
          />
        );
      })}

      {/* Ramificaciones secundarias — ocultas en móvil para no saturar;
          entran al final de la secuencia, como detalles */}
      <g className="hidden md:inline">
        {SATELLITES.map((sat) => (
          <g key={sat.id} ref={registerParallax(sat.id)} style={parallaxStyle}>
            <g
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "scale(1)" : "scale(0.85)",
                transformOrigin: `${sat.cx}px ${sat.cy}px`,
                transition: prefersReducedMotion
                  ? undefined
                  : `opacity ${SATELLITE_DURATION}ms var(--ease-default) ${sat.delay}ms, transform ${SATELLITE_DURATION}ms var(--ease-default) ${sat.delay}ms`,
              }}
            >
              <line
                x1={sat.from.cx}
                y1={sat.from.cy}
                x2={sat.cx}
                y2={sat.cy}
                stroke={sat.stroke}
                strokeWidth={1.5}
                strokeOpacity={sat.strokeOpacity}
              />
              <circle cx={sat.cx} cy={sat.cy} r={sat.r} fill={sat.fill} fillOpacity={sat.fillOpacity} />
            </g>
          </g>
        ))}
      </g>

      {/* Nodos principales + etiquetas — cada uno con fade + scale desde su
          propio centro, en orden narrativo */}
      {MAIN_NODES.map((node) => (
        <g key={node.id} ref={registerParallax(node.id)} style={parallaxStyle}>
          <g
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "scale(1)" : "scale(0.82)",
              transformOrigin: `${node.cx}px ${node.cy}px`,
              transition: prefersReducedMotion
                ? undefined
                : `opacity ${NODE_DURATION}ms var(--ease-default) ${node.delay}ms, transform ${NODE_DURATION}ms var(--ease-default) ${node.delay}ms`,
            }}
          >
            <circle cx={node.cx} cy={node.cy} r={node.r} fill={node.fill} />
            {/* CÓDIGO cierra el recorrido con un destello único al
                encenderse — un solo disparo, nunca en loop */}
            {node.id === "codigo" ? (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="none"
                stroke="var(--brand-green-light)"
                strokeWidth={2}
                style={{
                  opacity: 0,
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  animation:
                    revealed && !prefersReducedMotion
                      ? `nodegraph-code-pulse ${CODE_PULSE_DURATION}ms var(--ease-default) ${CODE_PULSE_DELAY}ms 1 forwards`
                      : undefined,
                }}
              />
            ) : null}
          </g>
          <text
            x={node.labelX}
            y={node.labelY}
            textAnchor="middle"
            className={cn("font-mono text-[10px] tracking-widest", node.labelClass)}
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0px)" : "translateY(6px)",
              transition: prefersReducedMotion
                ? undefined
                : `opacity ${LABEL_DURATION}ms var(--ease-default) ${node.delay + LABEL_DELAY_OFFSET}ms, transform ${LABEL_DURATION}ms var(--ease-default) ${node.delay + LABEL_DELAY_OFFSET}ms`,
            }}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
