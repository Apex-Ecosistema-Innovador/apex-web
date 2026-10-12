"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useScrolled } from "@/hooks/useScrolled";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const links = [
  { label: "¿Quiénes somos?", href: "#quienes-somos" },
  { label: "¿Que buscamos mejorar?", href: "#problema" },
  { label: "Modelo", href: "#modelo" },
  { label: "Investigación", href: "#investigacion" },
  { label: "Visión", href: "#vision" },
  { label: "Equipo", href: "#equipo" },
];
const sectionIds = links.map((link) => link.href.slice(1));

// Cuánto dura la línea de bienvenida al llegar por click: trazo + una
// pausa breve totalmente visible, luego se desvanece. Menos de un segundo
// de punta a punta — es una confirmación, no un espectáculo.
const ARRIVAL_HOLD_MS = 480;
const ARRIVAL_FADE_MS = 280;

type ArrivalPhase = "hidden" | "traced" | "fading";

export function Navbar() {
  const scrolled = useScrolled();
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [arrivalPhase, setArrivalPhase] = useState<ArrivalPhase>("hidden");
  const intersectingRef = useRef<Set<string>>(new Set());
  const pendingArrivalRef = useRef<string | null>(null);
  const arrivalTimeoutsRef = useRef<number[]>([]);

  // El navbar envuelve en varias líneas en móvil (logo + enlaces), así que su
  // alto real cambia por breakpoint — se mide en vivo en vez de asumir un
  // valor fijo, y alimenta --navbar-height (scroll-padding-top en globals.css)
  // más el offset del scroll-spy de abajo.
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    function updateHeight() {
      const height = node!.offsetHeight;
      setNavbarHeight(height);
      document.documentElement.style.setProperty("--navbar-height", `${height}px`);
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      arrivalTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function triggerArrival() {
    if (prefersReducedMotion) return;
    arrivalTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    arrivalTimeoutsRef.current = [];
    setArrivalPhase("traced");
    const fadeId = window.setTimeout(() => setArrivalPhase("fading"), ARRIVAL_HOLD_MS);
    const resetId = window.setTimeout(() => setArrivalPhase("hidden"), ARRIVAL_HOLD_MS + ARRIVAL_FADE_MS);
    arrivalTimeoutsRef.current.push(fadeId, resetId);
  }

  function handleNavClick(id: string) {
    // No se llama a preventDefault en ningún punto: el <a> hace su navegación
    // nativa de siempre (scroll suave vía CSS en globals.css), esto solo
    // observa cuándo esa sección "llega" para disparar la bienvenida.
    if (intersectingRef.current.has(id)) {
      triggerArrival();
      return;
    }
    pendingArrivalRef.current = id;
  }

  // Scroll-spy: qué sección está "activa" (para resaltar su enlace) y,
  // cuando coincide con un click reciente del navbar, dispara la bienvenida.
  // rootMargin recorta la banda de detección justo debajo del navbar y a
  // solo el 30% superior del viewport, para que "activo" sea la sección que
  // el usuario está realmente leyendo, no cualquiera parcialmente visible.
  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const elementsInDocumentOrder = [...elements].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) intersectingRef.current.add(id);
          else intersectingRef.current.delete(id);
        }

        let current: string | null = null;
        for (const element of elementsInDocumentOrder) {
          if (intersectingRef.current.has(element.id)) current = element.id;
        }
        setActiveId(current);

        if (pendingArrivalRef.current && intersectingRef.current.has(pendingArrivalRef.current)) {
          triggerArrival();
          pendingArrivalRef.current = null;
        }
      },
      { rootMargin: `-${navbarHeight + 4}px 0px -70% 0px`, threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navbarHeight]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-(--duration-fast) ease-default",
          scrolled
            ? "border-subtle bg-canvas/95 backdrop-blur-sm"
            : "border-transparent bg-transparent",
        )}
      >
        <Container>
          <nav className="flex flex-wrap items-center justify-between gap-4 py-4">
            <a href="#quienes-somos" className="order-1 flex items-center gap-2">
              <Image
                src="/brand/logo.png"
                alt=""
                width={701}
                height={653}
                className="h-7 w-auto object-contain"
              />
              <Image
                src="/brand/wordmark.png"
                alt="APEX"
                width={1536}
                height={1024}
                className="h-7 w-auto object-contain"
              />
            </a>
            <ul className="order-3 flex w-full flex-wrap gap-x-6 gap-y-1 font-body text-sm text-secondary lg:order-2 lg:w-auto">
              {links.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeId === id;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => handleNavClick(id)}
                      className={cn(
                        "group relative inline-block py-1 outline-none",
                        !prefersReducedMotion && "transition-colors duration-(--duration-fast) ease-default",
                        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        isActive ? "text-accent" : "hover:text-accent",
                      )}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left bg-(--brand-green-light)",
                          !prefersReducedMotion && "transition-transform duration-(--duration-fast) ease-default",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                        )}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
            <Button href="/hackathon/inscripcion" variant="secondary" className="order-2 lg:order-3">
              Hackathon
            </Button>
          </nav>
        </Container>
      </header>

      {/* Bienvenida a la sección de destino tras un click en el navbar — una
          línea de acento que se traza y se desvanece, nunca en loop.
          Decorativa y ajena al layout: no depende de cada sección. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 z-40"
        style={{ top: "var(--navbar-height, 5rem)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
          <div
            className="h-0.5 origin-left rounded-full bg-(--brand-green-light)"
            style={{
              transform: arrivalPhase === "hidden" ? "scaleX(0)" : "scaleX(1)",
              opacity: arrivalPhase === "traced" ? 1 : 0,
              transition: prefersReducedMotion
                ? undefined
                : "transform 240ms var(--ease-default), opacity 260ms var(--ease-default)",
            }}
          />
        </div>
      </div>
    </>
  );
}
