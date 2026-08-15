/**
 * Micro-visuales por card de Problem.tsx — un pequeño gráfico SVG abstracto
 * por problema, en el mismo lenguaje visual del sitio (nodos, líneas,
 * formas geométricas). Cada uno se dibuja al entrar en viewport y reacciona
 * a hover/foco/tap reforzando su idea específica.
 *
 * Restricción de la tarea: solo transform, opacity y stroke-dashoffset se
 * animan. Cuando una reacción necesita "cambiar de color", se logra
 * superponiendo dos formas idénticas (una base, una de acento) y cruzando su
 * opacidad — nunca transicionando fill/stroke/border-color directamente.
 */

export type ProblemVisualVariant = "rigid-syntax" | "isolated-nodes" | "hidden-talent" | "shortcut";

interface VisualProps {
  revealed: boolean;
  active: boolean;
  prefersReducedMotion: boolean;
}

const VIEWBOX = "0 0 240 72";
const ENTER_DURATION = 260;
const ENTER_STAGGER = 65;
const ACTIVE_DURATION = 200;

// --- 01 · Enseñanza tradicional --------------------------------------------
// Líneas rígidas y apiladas (sintaxis) junto a un nodo de lógica apagado. Al
// reaccionar, se insinúa un intento de conexión que nunca llega a alcanzarlo.

const SYNTAX_BARS = [
  { y: 8, width: 130 },
  { y: 22, width: 98 },
  { y: 36, width: 146 },
  { y: 50, width: 82 },
];
const SYNTAX_NODE = { cx: 208, cy: 29 };
const SYNTAX_CONNECTOR_X1 = 168;
const SYNTAX_CONNECTOR_LEN = SYNTAX_NODE.cx - 9 - SYNTAX_CONNECTOR_X1;

function RigidSyntaxVisual({ revealed, active, prefersReducedMotion }: VisualProps) {
  const nodeDelay = SYNTAX_BARS.length * ENTER_STAGGER;

  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-[220px]" aria-hidden="true">
      {SYNTAX_BARS.map((bar, i) => (
        <rect
          key={i}
          x={6}
          y={bar.y}
          width={bar.width}
          height={6}
          rx={2}
          fill="color-mix(in oklab, var(--brand-green-pine) 55%, var(--text-muted))"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateX(0px)" : "translateX(-8px)",
            transition: prefersReducedMotion
              ? undefined
              : `opacity ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms, transform ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms`,
          }}
        />
      ))}

      {/* Nodo de lógica, apagado — su contorno base nunca cambia de color */}
      <circle
        cx={SYNTAX_NODE.cx}
        cy={SYNTAX_NODE.cy}
        r={9}
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "scale(1)" : "scale(0.8)",
          transformOrigin: `${SYNTAX_NODE.cx}px ${SYNTAX_NODE.cy}px`,
          transition: prefersReducedMotion
            ? undefined
            : `opacity ${ENTER_DURATION}ms var(--ease-default) ${nodeDelay}ms, transform ${ENTER_DURATION}ms var(--ease-default) ${nodeDelay}ms`,
        }}
      />
      {/* Halo superpuesto — el "casi se enciende" al reaccionar, sin llegar
          a encenderse del todo (queda sin desarrollar) */}
      <circle
        cx={SYNTAX_NODE.cx}
        cy={SYNTAX_NODE.cy}
        r={9}
        fill="none"
        stroke="color-mix(in oklab, var(--brand-green-light) 65%, var(--text-muted))"
        strokeWidth={1.5}
        style={{
          opacity: active ? 1 : 0,
          transition: prefersReducedMotion ? undefined : `opacity ${ACTIVE_DURATION}ms var(--ease-default)`,
        }}
      />

      {/* Intento de conexión — se insinúa al reaccionar pero nunca alcanza el nodo */}
      <line
        x1={SYNTAX_CONNECTOR_X1}
        y1={SYNTAX_NODE.cy}
        x2={SYNTAX_CONNECTOR_X1 + SYNTAX_CONNECTOR_LEN}
        y2={SYNTAX_NODE.cy}
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{
          opacity: revealed ? 0.9 : 0,
          strokeDasharray: SYNTAX_CONNECTOR_LEN,
          strokeDashoffset: active ? SYNTAX_CONNECTOR_LEN * 0.35 : SYNTAX_CONNECTOR_LEN,
          transition: prefersReducedMotion
            ? undefined
            : `opacity ${ENTER_DURATION}ms var(--ease-default) ${nodeDelay}ms, stroke-dashoffset ${ACTIVE_DURATION}ms var(--ease-default)`,
        }}
      />
    </svg>
  );
}

// --- 02 · Poca experimentación colaborativa --------------------------------
// Nodos aislados, sin líneas entre ellos. Al reaccionar, se insinúan las
// conexiones que podrían existir.

const ISOLATED_NODES = [
  { cx: 22, cy: 22, r: 5, fill: "var(--brand-green-light)" },
  { cx: 76, cy: 12, r: 6, fill: "var(--brand-yellow)" },
  { cx: 130, cy: 30, r: 5, fill: "var(--brand-green-light)" },
  { cx: 56, cy: 54, r: 6, fill: "var(--brand-yellow)" },
  { cx: 196, cy: 44, r: 5, fill: "var(--brand-green-light)" },
];
const ISOLATED_LINKS = [
  { from: 0, to: 1, color: "var(--brand-green-light)" },
  { from: 1, to: 2, color: "var(--brand-yellow)" },
  { from: 3, to: 1, color: "color-mix(in oklab, var(--brand-purple) 75%, var(--brand-green-light))" },
  { from: 2, to: 4, color: "var(--brand-yellow)" },
];

function IsolatedNodesVisual({ revealed, active, prefersReducedMotion }: VisualProps) {
  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-[220px]" aria-hidden="true">
      {ISOLATED_LINKS.map((link, i) => {
        const a = ISOLATED_NODES[link.from];
        const b = ISOLATED_NODES[link.to];
        return (
          <line
            key={i}
            x1={a.cx}
            y1={a.cy}
            x2={b.cx}
            y2={b.cy}
            stroke={link.color}
            strokeWidth={1.25}
            strokeLinecap="round"
            style={{
              opacity: active ? 0.55 : 0,
              transition: prefersReducedMotion ? undefined : `opacity ${ACTIVE_DURATION}ms var(--ease-default) ${i * 35}ms`,
            }}
          />
        );
      })}
      {ISOLATED_NODES.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={node.fill}
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.5)",
            transformOrigin: `${node.cx}px ${node.cy}px`,
            transition: prefersReducedMotion
              ? undefined
              : `opacity ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms, transform ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms`,
          }}
        />
      ))}
    </svg>
  );
}

// --- 03 · Talento que pasa desapercibido -----------------------------------
// Nodos uniformes con uno distinto que se pierde en el grupo. Al reaccionar,
// finalmente se nota.

const TALENT_DOTS = [
  { cx: 16, cy: 20 },
  { cx: 46, cy: 32 },
  { cx: 76, cy: 14 },
  { cx: 106, cy: 28 },
  { cx: 136, cy: 16 },
  { cx: 166, cy: 30 },
  { cx: 196, cy: 18 },
];
const TALENT_SPECIAL_INDEX = 3;

function HiddenTalentVisual({ revealed, active, prefersReducedMotion }: VisualProps) {
  const entranceTransition = (i: number) =>
    `opacity ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms, transform ${ENTER_DURATION}ms var(--ease-default) ${i * ENTER_STAGGER}ms`;
  const interactiveTransition = `opacity ${ACTIVE_DURATION}ms var(--ease-default), transform ${ACTIVE_DURATION}ms var(--ease-default)`;

  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-[220px]" aria-hidden="true">
      {TALENT_DOTS.map((dot, i) => {
        const isSpecial = i === TALENT_SPECIAL_INDEX;
        return (
          <g key={i}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={5}
              fill="var(--text-muted)"
              style={{
                opacity: revealed ? 0.8 : 0,
                transform: revealed ? "scale(1)" : "scale(0.6)",
                transformOrigin: `${dot.cx}px ${dot.cy}px`,
                transition: prefersReducedMotion ? undefined : entranceTransition(i),
              }}
            />
            {isSpecial ? (
              <>
                {/* Acento superpuesto — apenas se insinúa en reposo, se
                    revela con claridad al reaccionar */}
                <circle
                  cx={dot.cx}
                  cy={dot.cy}
                  r={5}
                  fill="var(--brand-green-light)"
                  style={{
                    opacity: revealed ? (active ? 1 : 0.4) : 0,
                    transform: active ? "scale(1.3)" : "scale(1)",
                    transformOrigin: `${dot.cx}px ${dot.cy}px`,
                    transition: prefersReducedMotion ? undefined : revealed ? interactiveTransition : entranceTransition(i),
                  }}
                />
                <circle
                  cx={dot.cx}
                  cy={dot.cy}
                  r={10}
                  fill="none"
                  stroke="var(--brand-purple-accessible)"
                  strokeWidth={1.5}
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? "scale(1)" : "scale(0.7)",
                    transformOrigin: `${dot.cx}px ${dot.cy}px`,
                    transition: prefersReducedMotion ? undefined : interactiveTransition,
                  }}
                />
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// --- 04 · Uso prematuro de IA generativa ------------------------------------
// Un recorrido de pasos con un atajo que salta directo del inicio al final.
// Al reaccionar, se marcan los pasos que el atajo se saltó.

const SHORTCUT_STEPS = [
  { cx: 14, cy: 46, r: 6, accent: true },
  { cx: 68, cy: 46, r: 5, accent: false },
  { cx: 122, cy: 46, r: 5, accent: false },
  { cx: 176, cy: 46, r: 5, accent: false },
  { cx: 226, cy: 46, r: 6, accent: true },
];
const SHORTCUT_ARC = "M14,46 Q120,10 226,46";
// Longitud aproximada del arco — ligeramente mayor a la real para evitar un
// hueco visible al final del trazo (ver nota sobre stroke-dasharray).
const SHORTCUT_ARC_LEN = 235;

function ShortcutVisual({ revealed, active, prefersReducedMotion }: VisualProps) {
  const segments = SHORTCUT_STEPS.slice(0, -1).map((step, i) => ({ from: step, to: SHORTCUT_STEPS[i + 1] }));
  const stepsDelay = segments.length * 70;
  const arcEntranceTransition = `opacity 200ms var(--ease-default) ${stepsDelay}ms, stroke-dashoffset 260ms var(--ease-default) ${stepsDelay}ms`;
  const arcInteractiveTransition = "opacity 200ms var(--ease-default)";

  return (
    <svg viewBox={VIEWBOX} className="h-auto w-full max-w-[240px]" aria-hidden="true">
      {segments.map((seg, i) => {
        const len = Math.hypot(seg.to.cx - seg.from.cx, seg.to.cy - seg.from.cy);
        return (
          <line
            key={i}
            x1={seg.from.cx}
            y1={seg.from.cy}
            x2={seg.to.cx}
            y2={seg.to.cy}
            stroke="var(--brand-green-pine)"
            strokeWidth={2}
            strokeOpacity={0.55}
            style={{
              strokeDasharray: len,
              strokeDashoffset: revealed ? 0 : len,
              transition: prefersReducedMotion ? undefined : `stroke-dashoffset 240ms var(--ease-default) ${i * 70}ms`,
            }}
          />
        );
      })}

      {/* El atajo — salta del inicio al final, esquivando los pasos intermedios */}
      <path
        d={SHORTCUT_ARC}
        fill="none"
        stroke="var(--brand-purple)"
        strokeWidth={2}
        style={{
          opacity: revealed ? (active ? 0.95 : 0.65) : 0,
          strokeDasharray: SHORTCUT_ARC_LEN,
          strokeDashoffset: revealed ? 0 : SHORTCUT_ARC_LEN,
          transition: prefersReducedMotion ? undefined : revealed ? arcInteractiveTransition : arcEntranceTransition,
        }}
      />

      {SHORTCUT_STEPS.map((step, i) => (
        <circle
          key={i}
          cx={step.cx}
          cy={step.cy}
          r={step.r}
          fill={step.accent ? "var(--brand-green-light)" : "var(--brand-green-pine)"}
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.7)",
            transformOrigin: `${step.cx}px ${step.cy}px`,
            transition: prefersReducedMotion
              ? undefined
              : `opacity 220ms var(--ease-default) ${i * 55}ms, transform 220ms var(--ease-default) ${i * 55}ms`,
          }}
        />
      ))}

      {/* Los pasos saltados se marcan al reaccionar */}
      {SHORTCUT_STEPS.map((step, i) => {
        if (step.accent) return null;
        return (
          <circle
            key={`skip-${i}`}
            cx={step.cx}
            cy={step.cy}
            r={step.r + 4}
            fill="none"
            stroke="var(--brand-purple-accessible)"
            strokeWidth={1.5}
            strokeDasharray="2.5 3"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "scale(1)" : "scale(0.75)",
              transformOrigin: `${step.cx}px ${step.cy}px`,
              transition: prefersReducedMotion
                ? undefined
                : `opacity 200ms var(--ease-default) ${i * 40}ms, transform 200ms var(--ease-default) ${i * 40}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

export function ProblemVisual({ variant, ...props }: { variant: ProblemVisualVariant } & VisualProps) {
  switch (variant) {
    case "rigid-syntax":
      return <RigidSyntaxVisual {...props} />;
    case "isolated-nodes":
      return <IsolatedNodesVisual {...props} />;
    case "hidden-talent":
      return <HiddenTalentVisual {...props} />;
    case "shortcut":
      return <ShortcutVisual {...props} />;
  }
}
