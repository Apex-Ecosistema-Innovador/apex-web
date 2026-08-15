export interface JourneyStep {
  id: string;
  order: number;
  label: string;
  description: string;
}

export const journey: JourneyStep[] = [
  {
    id: "diagnostico",
    order: 1,
    label: "Diagnóstico",
    description: "Se identifican las fortalezas y debilidades iniciales del estudiante.",
  },
  {
    id: "refuerzo",
    order: 2,
    label: "Refuerzo",
    description: "Se fortalecen los fundamentos de lógica y programación de base.",
  },
  {
    id: "retos-progresivos",
    order: 3,
    label: "Retos progresivos",
    description: "Se avanza a través de desafíos de dificultad creciente.",
  },
  {
    id: "trabajo-colaborativo",
    order: 4,
    label: "Trabajo colaborativo",
    description: "Se resuelven problemas en equipo dentro de espacios estructurados.",
  },
  {
    id: "competencia-formativa",
    order: 5,
    label: "Competencia formativa",
    description: "Se pone a prueba el progreso mediante retos y dinámicas competitivas.",
  },
  {
    id: "identificacion-talento",
    order: 6,
    label: "Identificación de talento",
    description: "Se reconoce a estudiantes con potencial hacia la programación competitiva.",
  },
  {
    id: "proyeccion-competencias",
    order: 7,
    label: "Proyección hacia competencias",
    description: "Se orienta al estudiante hacia hackatones y maratones de programación.",
  },
];
