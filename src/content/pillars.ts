export interface Pillar {
  id: string;
  name: string;
  tagline: string;
  description: string;
  concepts: string[];
}

export const pillars: Pillar[] = [
  {
    id: "refuerzo",
    name: "REFUERZO",
    tagline: "Fortalece tus bases.",
    description:
      "Detectar debilidades y fortalecer fundamentos mediante acompañamiento y rutas de aprendizaje diferenciadas.",
    concepts: ["Acompañamiento", "Rutas de aprendizaje", "Retroalimentación"],
  },
  {
    id: "competencia",
    name: "PARTICIPACION COMPETITIVA",
    tagline: "Convierte problemas en desafíos.",
    description:
      "Usar la competencia formativa, la gamificación y el trabajo en equipo como herramienta pedagógica, no como búsqueda de ganadores.",
    concepts: ["Retos", "Gamificación", "Trabajo en equipo"],
  },
  {
    id: "retencion",
    name: "RETENCION ESTUDIANTIL",
    tagline: "Transforma progreso en permanencia.",
    description:
      "Construir condiciones que estén orientadas a fortalecer la motivación y la permanencia estudiantil.",
    concepts: ["Motivación", "Progreso", "Permanencia"],
  },
];
