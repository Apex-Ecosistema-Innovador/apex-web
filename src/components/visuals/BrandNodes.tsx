"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Composición compacta de nodos morados en cascada (Lógica → Retos →
 * Crecimiento), en el mismo lenguaje visual que NodeGraph.tsx pero a menor
 * escala y con los nodos superpuestos entre sí. Decorativa (aria-hidden):
 * el significado ya está cubierto por el copy de BrandIntro.
 */
const nodes = [
  {
    word: "LÓGICA",
    cx: 62,
    cy: 54,
    r: 38,
    fillClass: "fill-brand-purple",
    fillOpacity: "1",
    labelClass: "fill-primary",
  },
  {
    word: "RETOS",
    cx: 118,
    cy: 92,
    r: 32,
    fillClass: "fill-brand-purple",
    fillOpacity: "0.6",
    labelClass: "fill-primary",
  },
  {
    word: "CRECIMIENTO",
    cx: 88,
    cy: 145,
    r: 34,
    fillClass: "fill-brand-purple-accessible",
    fillOpacity: "0.9",
    labelClass: "fill-canvas",
  },
];

const satellites = [
  { cx: 170, cy: 45, r: 4, connectTo: nodes[1] },
  { cx: 35, cy: 115, r: 3, connectTo: nodes[0] },
];

export function BrandNodes() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const revealed = prefersReducedMotion || isInView;

  return (
    <div ref={ref} className="w-full max-w-[190px] sm:max-w-[220px] md:max-w-[200px] lg:max-w-[240px]">
      <svg viewBox="0 0 220 190" className="h-auto w-full" aria-hidden="true">
        <g
          className={cn(
            "transition-opacity duration-(--duration-slow) ease-default",
            revealed ? "opacity-100" : "opacity-0",
          )}
        >
          {satellites.map((s) => (
            <line
              key={`${s.cx}-${s.cy}-line`}
              x1={s.cx}
              y1={s.cy}
              x2={s.connectTo.cx}
              y2={s.connectTo.cy}
              className="stroke-brand-purple-accessible"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
          ))}
          <line
            x1={nodes[0].cx}
            y1={nodes[0].cy}
            x2={nodes[1].cx}
            y2={nodes[1].cy}
            className="stroke-brand-purple"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line
            x1={nodes[1].cx}
            y1={nodes[1].cy}
            x2={nodes[2].cx}
            y2={nodes[2].cy}
            className="stroke-brand-purple"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {satellites.map((s) => (
            <circle
              key={`${s.cx}-${s.cy}-dot`}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              className="fill-brand-purple-accessible"
              fillOpacity="0.5"
            />
          ))}
        </g>

        {nodes.map((n, index) => (
          <g
            key={n.word}
            style={
              prefersReducedMotion
                ? undefined
                : { transitionDelay: `${index * 120}ms` }
            }
            className={cn(
              "transition-opacity duration-(--duration-slow) ease-default",
              revealed ? "opacity-100" : "opacity-0",
            )}
          >
            <circle cx={n.cx} cy={n.cy} r={n.r} className={n.fillClass} fillOpacity={n.fillOpacity} />
            <text
              x={n.cx}
              y={n.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono text-[8px] uppercase tracking-wide", n.labelClass)}
            >
              {n.word}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
