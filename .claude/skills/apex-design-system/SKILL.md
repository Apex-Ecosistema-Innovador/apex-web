---
name: apex-design-system
description: Sistema de diseño oficial del proyecto APEX (investigación APIT - Politécnico Colombiano Jaime Isaza Cadavid). Úsala SIEMPRE que se trabaje en estilos visuales, colores, tipografía, espaciado, animaciones o componentes de UI de este proyecto — incluye peticiones como "dale diseño a esta sección", "aplica la paleta", "hazlo responsive", "agrega animaciones", o cualquier trabajo sobre archivos .tsx de components/ui, components/sections, components/visuals o globals.css.
---

# Sistema de diseño APEX

Este proyecto es la identidad digital de una investigación en Fase 1 (diseño y 
validación) sobre metodología de enseñanza de programación. La estética debe 
sentirse: **developer tools + investigación seria**, nunca "landing de IA genérica" 
ni "portal institucional universitario".

## Principio rector

Cada decisión visual se filtra por esta pregunta: **¿esto se vería en un IDE, un 
dashboard técnico o una plataforma de programación competitiva? ¿O se ve en 
cualquier landing genérica hecha con un template?** Si es lo segundo, se rehace.

---

## 1. Color

### Paleta oficial de marca (jerarquía definida por el equipo de diseño — respetar, no está a discusión)

| Rol de marca | Token | Hex |
|---|---|---|
| **Color principal** | `--brand-green-pine` | `#00842d` |
| Complementario | `--brand-green-light` | `#96ff27` |
| Complementario | `--brand-yellow` | `#ede200` |
| Tono/Acento | `--brand-charcoal` | `#3a3a3a` |
| Tono/Acento | `--brand-purple` | `#8709d8` |

### Cómo se traduce esa jerarquía a un sitio dark-first (regla de contraste)

El Verde Pino es el color principal, pero como **texto pequeño sobre fondo oscuro 
no pasa contraste** (ratio ~3.9:1). La solución NO es minimizarlo — es usarlo como 
**superficie**, no como texto:

- **`--brand-green-pine` (principal)**: fondos de secciones alternas, paneles/fills 
  grandes, formas de diagrama (nodos, pipelines), bordes fuertes, rellenos de 
  íconos grandes, franjas divisorias. Es el color que define el "peso" visual del 
  layout. Puede llevar texto claro (`--text-primary`) encima sin problema — ahí el 
  contraste sí funciona bien (fondo oscuro + texto casi blanco).
- **`--brand-green-light` y `--brand-yellow` (complementarios)**: texto de acento, 
  headlines destacados, estados hover/focus/activo, highlights de datos y 
  estadísticas, CTAs primarios. Es lo que "habla" — alto contraste, siempre legible 
  como texto pequeño sobre `--bg-base`.
- **`--brand-charcoal` #3a3a3a (acento)**: base de fondo con más presencia de lo 
  habitual — no solo superficie de card, también franjas y bloques de fondo 
  oscuros protagonistas. Encaja con la dirección "developer tool" del sitio.
- **`--brand-purple` (acento)**: fill de forma pequeña con texto claro encima, 
  puntuación/separadores (como en el logo), detalles de badges. Contraste bajo 
  como texto (~2.8:1) — si necesitas texto morado legible, usa la variante 
  aclarada `--brand-purple-accessible: #c9a6ff` (verificar ≥4.5:1 antes de usar).

### Fondo base (derivado — el lienzo, más oscuro que antes)

```css
--bg-base: #08090a;        /* casi negro puro, apenas tinte verde */
--bg-surface: #101210;     /* secciones alternas sutiles */
--bg-elevated: #3a3a3a;    /* cards — el "negro" oficial de marca, con más presencia */
--bg-principal-fill: #00842d;  /* Verde Pino usado como superficie/fill grande */
--border-subtle: rgba(255,255,255,0.08);
--border-default: rgba(255,255,255,0.16);
--border-principal: rgba(0,132,45,0.5);  /* borde con tinte de Verde Pino */
```

### Texto

```css
--text-primary: #f4f6f1;
--text-secondary: rgba(244,246,241,0.65);
--text-muted: rgba(244,246,241,0.42);
--text-accent: var(--brand-green-light);   /* acento de texto por defecto */
--text-accent-alt: var(--brand-yellow);    /* datos, estadísticas, estados */
```

### Regla de acento por sección

Cada sección elige **un rol dominante**: o Verde Pino como fondo/superficie 
(sección "pesada"), o fondo neutro con Verde Claro/Amarillo como acento de texto 
(sección "ligera"). No mezclar ambos modos en la misma sección. Alternar entre 
secciones pesadas y ligeras a lo largo de la página le da ritmo visual sin que 
compitan los colores entre sí.

### Logo (pendiente de asset)

El logo oficial (flechas degradadas verde) necesita una versión con **fondo 
transparente** — los archivos actuales traen fondo blanco sólido incrustado y no 
sirven sobre `--bg-base` oscuro. Cuando esté disponible como `.svg`, va en 
`/public/brand/logo.svg` y se consume vía el componente `<Logo />` (aún no creado). 
No recrear el logo con CSS/gradientes como sustituto — esperar el asset real.

## 2. Tipografía

- **Display** (`--font-display`): Chakra Petch — h1, h2, títulos de sección, el 
  wordmark si no hay SVG del logo disponible.
- **Body** (`--font-body`): Inter — párrafos, descripciones, UI copy, botones.
- **Mono** (`--font-mono`): JetBrains Mono — SOLO para: etiquetas de fase 
  ("FASE 1"), números de sección ("01", "02"), badges técnicos, timestamps, 
  cualquier dato tipo "código". Nunca para párrafos largos.

Cargar las tres con `next/font/google` en `layout.tsx` como variables CSS. No 
usar más de estas tres familias en todo el sitio.

Jerarquía tipográfica (usar clases de Tailwind consistentes, no valores libres):
- H1: `text-5xl md:text-7xl font-display font-medium tracking-tight`
- H2 (título de sección): `text-3xl md:text-5xl font-display font-medium`
- Body grande: `text-lg md:text-xl font-body text-text-secondary`
- Body: `text-base font-body`
- Label mono: `text-xs md:text-sm font-mono uppercase tracking-widest`

---

## 3. Espaciado y layout

Escala de espaciado — usar SOLO estos valores para padding/margin/gap entre 
bloques grandes (dentro de componentes pequeños se puede usar escala normal de 
Tailwind):

No uses paddings arbitrarios como `py-17` o `px-5.5`. Consistencia > creatividad 
en el spacing.

---

## 4. Bordes y radios

- Radio por defecto: `rounded-lg` (8px). Máximo `rounded-xl` (12px) en cards 
  grandes. **Nunca** `rounded-2xl`/`rounded-3xl`/`rounded-full` en cards o 
  botones — eso es estética SaaS genérica que el proyecto explícitamente evita.
- Bordes: 1px, `--border-subtle` en reposo, `--border-default` en hover/focus. 
  Preferir bordes discretos sobre sombras pesadas — es lenguaje de interfaz de 
  desarrollador (terminal, IDE), no de app de consumo.
- Sombras: uso mínimo. Si se usa, sombra sutil y oscura (`shadow-black/40`), 
  nunca sombras de color (nada de `shadow-green-500/50` tipo glow genérico de IA).

---

## 5. Animación

**Regla #1: CSS antes que JavaScript.** Solo usar Framer Motion si hay 
orquestación real (secuencias encadenadas). Hover, fade-in, scroll reveal simple 
→ CSS puro.

**Regla #2: solo animar `transform` y `opacity`.** Nunca `width`, `height`, `top`, 
`left`, `margin` — cuestan performance y traban en móvil.

**Regla #3: `prefers-reduced-motion` siempre respetado.** Todo componente animado 
debe leer `useReducedMotion()` (ya existe el hook base) y, si es `true`, renderizar 
sin transición o con una transición casi instantánea.

**Duración y easing estándar:**
```css
--ease-default: cubic-bezier(0.22, 1, 0.36, 1);
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 600ms;
```

**Scroll reveal**: usar el hook `useInView` ya existente + clase que pasa de 
`opacity-0 translate-y-4` a `opacity-100 translate-y-0`. Aplicar a bloques 
completos de sección, no a cada palabra o ícono individual (evitar el efecto 
"cada letra vuela por separado" — se ve genérico y distrae).

**Hover en cards**: solo `border-color` + leve `translate-y` (2-4px) + duración 
`--duration-fast`. Nada de scale grandes, nada de rotación, nada de glow.

---

## 6. Qué evitar explícitamente (anti-patrones de "diseño hecho por IA")

- Gradientes morados/azules difusos de fondo tipo blob
- Glassmorphism (`backdrop-blur` + transparencia) como recurso genérico sin 
  justificación funcional
- Iconos de Lucide puestos "porque sí" en cada card sin relación con el contenido
- Grids de 3 cards idénticas con el mismo layout repetido más de 2-3 veces en 
  la página
- Emojis en el copy o la UI
- Botones con `rounded-full` y gradiente — es el patrón más reconocible de 
  "landing genérica de producto de IA"
- Texto centrado por defecto en bloques largos — usar alineación izquierda para 
  contenido denso, centrado solo en hero/CTAs cortos
- Contadores animados de números que no existen en el documento fuente — si 
  no hay dato real y verificado (ver `stats.ts`), no se muestra como estadística

---

## 7. Responsive

No es "desktop que se apila en móvil". Reglas concretas:

- Pipelines/diagramas horizontales (LearningJourney, CompetitivePath) → en 
  `md:` hacia abajo se leen como flujo vertical con conectores verticales, no 
  como el mismo horizontal comprimido con scroll.
- Grids de 3-4 columnas → 1 columna en móvil (`grid-cols-1 md:grid-cols-3`), 
  nunca 2 columnas apretadas como paso intermedio salvo que el contenido lo 
  pida explícitamente.
- Tamaños de texto con breakpoints explícitos, nunca un solo tamaño fijo grande 
  que rompe en 360px.
- Botones: full-width en móvil dentro de su contenedor cuando estén en hero o 
  CTA final; inline con `w-auto` en desktop.

---

## 8. Componentes ya existentes a respetar

No dupliques lógica: usa `cn()` de `lib/cn.ts` para clases condicionales, 
`Container` para ancho máximo, `SectionHeading` para encabezados de sección, 
`Reveal` para scroll animation, `PhaseTag`/`Badge` para etiquetas. Si necesitas 
una variante nueva de un componente ui/ existente, agrégala como prop 
(`variant="..."`), no crees un componente paralelo.

## Principios transversales de diseño (aplican a todas las secciones)

### Uso del morado como acento
- Verde claro (#96ff27) y amarillo (#ede200) son los colores dominantes/principales.
- El morado (--brand-purple #8709d8 y su variante legible --brand-purple-accessible 
  #c9a6ff) SIEMPRE debe estar presente, pero SOLO en detalles: bordes activos, 
  puntos/nodos secundarios, líneas de conexión, glows sutiles de fondo, estados 
  hover/activo, separadores. Nunca como color dominante de una sección ni como 
  fondo grande.
- Regla práctica: si el morado es lo primero que se ve en una sección, hay demasiado.

### Interactividad
- Las secciones deben invitar a la interacción, no ser estáticas. Preferir 
  elementos que respondan al usuario: hover con feedback visual claro, paneles 
  que se expanden/revelan al hacer click, alternadores (toggles/tabs), estados 
  que cambian según la acción del usuario.
- La interactividad debe aportar a la comprensión o al disfrute, no ser adorno.
- Siempre accesible: todo lo interactivo debe funcionar con teclado (foco visible, 
  Enter/Space), tener roles ARIA correctos, y respetar prefers-reduced-motion.
- Rendimiento: solo animar transform y opacity. Nada de animar width/height/top/left.