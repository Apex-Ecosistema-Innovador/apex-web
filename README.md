# APEX

Sitio web del proyecto de investigación universitario **APEX** (nombre de marca).

Proyecto formal: *"Modelo metodológico para el fortalecimiento en el desempeño
académico en programación y desarrollo de lógica en APIT"*.

## Stack

- [Next.js](https://nextjs.org) (App Router) — nota: esta instalación puede tener
  cambios respecto a versiones anteriores; ver `AGENTS.md` y
  `node_modules/next/dist/docs/` antes de tocar convenciones de rutas/archivos.
- TypeScript
- Tailwind CSS v4 (tokens vía `@theme` en `globals.css`, no `tailwind.config.js`)
- `clsx` + `tailwind-merge` (helper `cn` en `src/lib/cn.ts`)
- `next/font/google`: Chakra Petch (display), Inter (body), JetBrains Mono (mono)

## Sistema de diseño

El sistema de diseño oficial vive en
[`.claude/skills/apex-design-system/SKILL.md`](.claude/skills/apex-design-system/SKILL.md)
— consultarlo siempre antes de tocar estilos, colores, tipografía, espaciado,
animaciones o `components/ui`, `components/sections`, `components/visuals` o
`globals.css`. Resumen de lo ya implementado (solo en `layout.tsx`, `globals.css`
y `components/ui|layout/`; **`components/sections/` todavía no tiene el
rediseño aplicado**, sigue con estilos neutros de la fase anterior):

- **Color** (`src/app/globals.css`): paleta de marca completa (`--brand-green-pine`,
  `--brand-green-light`, `--brand-yellow`, `--brand-charcoal`, `--brand-purple`)
  + fondo base oscuro derivado (`--bg-base`, `--bg-surface`, `--bg-elevated`,
  `--bg-principal-fill`) + tokens de texto y borde, expuestos a Tailwind vía
  `@theme inline` como clases `bg-base`, `text-accent`, `border-subtle`, etc.
- **Tipografía**: `font-display` (Chakra Petch, h1/h2), `font-body` (Inter,
  párrafos/UI) y `font-mono` (JetBrains Mono, etiquetas tipo "FASE 1"/"01").
- **Animación**: `--ease-default` (registrado en `@theme`, genera la clase
  `ease-default`) y `--duration-fast/base/slow` — **importante**: Tailwind v4
  no tiene namespace temático para duración (a diferencia de `--ease-*`), así
  que estas se consumen con la sintaxis de valor arbitrario
  `duration-(--duration-fast)`, no como clase `duration-fast` directa.
- **Radios**: sin tokens custom — se usa `rounded-lg`/`rounded-xl` nativos de
  Tailwind, que ya coinciden con los valores de la skill (8px/12px).
- `Reveal` ya anima de verdad (`opacity-0 translate-y-4` → `opacity-100
  translate-y-0`, solo `transform`/`opacity`), usando `useInView`
  (IntersectionObserver real, ya no un stub) y respetando
  `useReducedMotion` (media query real, ya no un stub).

## Estructura

```
src/
  app/            App Router (page.tsx, layout.tsx, globals.css)
  components/
    layout/       Navbar, Footer, Container (wrapper de ancho máximo)
    sections/     Una sección por bloque narrativo de la landing
    ui/           Piezas reutilizables (Button, Badge, PhaseTag, SectionHeading, Reveal)
    visuals/      Diagramas/visualizaciones (NodeGraph, PipelineFlow, CodePathDiagram)
  content/        Datos tipados que alimentan las secciones
  lib/            Utilidades (cn.ts)
  hooks/          useReducedMotion, useInView
```

`src/app/` fue movido desde `app/` en la raíz para mantener todo el código de la
aplicación bajo `src/`; el alias `@/*` en `tsconfig.json` apunta a `src/*`.

## Estado actual

**Fase: sistema de diseño base implementado en `ui/`, secciones aún sin
rediseñar.** `layout.tsx`, `globals.css` y los componentes de `components/ui/`
y `components/layout/` (Navbar, Footer) ya usan la paleta oscura, tipografía y
tokens de animación reales de la skill `apex-design-system`. Las 12 secciones
de `components/sections/` siguen consumiendo sus datos de `src/content/` vía
`.map()`, pero **todavía con los estilos neutros de la fase anterior** (grises
por defecto de Tailwind) — aplicarles el sistema de diseño es el siguiente paso.

Los archivos de `src/content/` tienen la data real del proyecto (tipo + array):

| Archivo             | Contenido                                                         |
| -------------------- | ------------------------------------------------------------------ |
| `problems.ts`         | 4 problemas que motivan el proyecto                                |
| `pillars.ts`          | 3 pilares del modelo: REFUERZA, COMPITE, AVANZA                    |
| `journey.ts`          | 7 pasos del recorrido del estudiante                                |
| `methodology.ts`      | 4 instrumentos de la metodología (documental, entrevista, rúbrica de expertos, grupo focal) |
| `roadmap.ts`          | 6 fases del proyecto (sin fechas), marcadas como `actual`/`futuro` |
| `impact.ts`           | 4 enunciados de impacto esperado (en condicional/prospectivo)      |
| `team.ts`             | Equipo de investigación y estudiantes investigadores               |
| `stats.ts`            | Las 3 únicas cifras permitidas, cada una con su fuente citada       |

### Reglas de contenido (importante, respetar en todo el copy futuro)

- El proyecto está en **Fase 1: diagnóstico, diseño y validación** — no se ha
  implementado ni hay una prueba piloto. La metodología es cualitativa
  (análisis documental, entrevistas, validación por juicio de expertos y
  grupo focal), sin experimentación con estudiantes en esta fase.
- Nunca usar cifras/resultados como si ya hubieran ocurrido, ni verbos de
  impacto en pasado ("logramos", "mejoramos"). Usar siempre condicional o
  prospectivo ("busca", "pretende", "está orientado a", "se espera").
- Las únicas cifras permitidas en todo el sitio son las 3 de `stats.ts`, y
  siempre deben mostrarse junto con su fuente.

Orden narrativo de las secciones en `src/app/page.tsx`, con el `id` real de cada
`<section>` (en español, para que coincidan con los anclas del Navbar y los
botones del Hero):

1. Navbar
2. Hero — `#hero`
3. Problem — `#problema`
4. ParadigmShift — `#cambio-de-paradigma`
5. Pillars — `#modelo`
6. LearningJourney — `#recorrido`
7. AISection — `#ia`
8. CompetitivePath — `#camino-competitivo`
9. FutureLab — `#vision`
10. Research — `#investigacion`
11. Impact — `#impacto`
12. Team — `#equipo`
13. FinalCTA — `#cierre`
14. Footer

El Navbar enlaza a Problema, Modelo, Investigación, Visión y Equipo; los dos
botones del Hero apuntan a `#problema` y `#modelo`.

### Componentes `ui/` ya implementados (con el sistema de diseño aplicado)

- `Button` — variantes `primary` (fondo `--brand-green-light`, texto oscuro)
  y `secondary` (borde `--border-default`, hover `--border-principal`);
  renderiza `<a>` si recibe `href`, o `<button>` si no. `rounded-lg`, sin
  `rounded-full` ni gradientes.
- `Badge` — fondo `--bg-elevated`, borde `--border-subtle`, texto `font-mono`
  pequeño, `rounded-lg` (no pill). Acepta `className` para que otros
  componentes (como `PhaseTag`) lo extiendan.
- `PhaseTag` — `Badge` con indicador `●`/`○`; `status="actual"` usa acento
  `--brand-green-light` (`border-principal text-accent`), `status="futuro"`
  se ve apagado (`text-muted`, sin acento).
- `SectionHeading` — `eyebrow` en `font-mono uppercase tracking-widest
  text-accent`, `title` en `font-display` (jerarquía H2 de la skill),
  `description` en `font-body text-secondary`. Alineado a la izquierda.
- `Reveal` — scroll-reveal real (ver sección de animación arriba).

## Próximos pasos (pendientes)

- Aplicar el sistema de diseño a `components/sections/` (hoy usan grises
  neutros de la fase anterior, no los tokens de marca).
- Reescribir el copy final de cada sección (Hero, AISection, CompetitivePath y
  FutureLab tienen copy corto de placeholder pensado para reescritura).
- Envolver bloques de sección con `Reveal` para activar el scroll-reveal.
- Implementar las visualizaciones (`NodeGraph`, `PipelineFlow`, `CodePathDiagram`)
  para reemplazar las listas de texto plano de `ParadigmShift`, `LearningJourney`
  y `CompetitivePath`.
- Sticky nav / scroll spy en el Navbar (hoy son solo `<a href="#...">` planos).
- Conseguir el asset del logo con fondo transparente (`/public/brand/logo.svg`)
  y crear el componente `<Logo />` — hoy el Navbar usa texto "APEX" en su lugar.

## Desarrollo

El gestor de paquetes es **pnpm** (versión fijada en `packageManager`; con Corepack, `corepack enable` la instala sola). Requiere Node 24.

```bash
pnpm install
pnpm dev         # servidor de desarrollo
pnpm build       # build de producción
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest
```

Abrir [http://localhost:3000](http://localhost:3000). Si ese puerto lo usa otro proyecto: `pnpm dev -p 3002` (el API espera `http://localhost:3002` por defecto en `APEX_WEB_BASE_URL`).

Los scripts de compilación de dependencias se aprueban en `pnpm-workspace.yaml` (`allowBuilds`).

## Inscripción a la hackathon

Rutas bajo `/hackathon`:

| Ruta | Qué hace |
| ---- | -------- |
| `/hackathon/inscripcion` | Formulario de registro (cuenta + perfil + contexto + reglamento y consentimientos). Muestra un aviso si las inscripciones están cerradas. |
| `/hackathon/verificar-correo` | Recibe el enlace del correo (`#token=…`), verifica la cuenta y permite pedir un enlace nuevo. |
| `/hackathon/reglamento` | Reglamento vigente del evento (versionado). |
| `/hackathon/autorizacion-datos` | Autorización de tratamiento de datos (versionada). |

Los datos viven en `apex-api`. Configuración en `.env.local` (ver `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_EVENTO_ID=<id que imprime `pnpm seed:hackathon` en apex-api>
```

`NEXT_PUBLIC_API_URL` también alimenta `connect-src` del CSP (`src/proxy.ts`): el navegador solo puede llamar a ese origen.

Notas de implementación:

- Formulario con `react-hook-form` + Zod (`src/lib/hackathon/esquema.ts`). Las reglas están duplicadas en el API (`apex-api`), que siempre vuelve a validar. Zod corre en modo `jitless` para no disparar violaciones de CSP por `eval`.
- El texto del reglamento y de la autorización de datos (`src/content/hackathon/`) es **provisional**: lo deben revisar el comité y la oficina jurídica. Para publicar una nueva versión se agrega la clave en el mapa y se actualiza la versión en el API.
- Accesibilidad: cada control tiene `label` asociado, errores con `role="alert"` y `aria-describedby`, todo operable con teclado y texto con contraste mínimo 4,5:1 (por eso las ayudas usan `text-secondary` y no `text-muted`).
- Las páginas usan `await connection()` para que el CSP con nonce se aplique, igual que la home.
