export interface RoadmapPhase {
  id: string;
  order: number;
  label: string;
  status: "actual" | "futuro";
  description: string;
}

export const roadmap: RoadmapPhase[] = [
  {
    id: "diagnostico",
    order: 1,
    label: "Diagnóstico",
    status: "actual",
    description: "Caracterización del problema y del contexto del APIT.",
  },
  {
    id: "diseno-modelo",
    order: 2,
    label: "Diseño del modelo",
    status: "actual",
    description: "Construcción del modelo metodológico y sus pilares.",
  },
  {
    id: "validacion-expertos-grupo-focal",
    order: 3,
    label: "Validación con expertos y grupo focal",
    status: "actual",
    description: "Validación por juicio de expertos y grupo focal con estudiantes.",
  },
  {
    id: "modelo-consolidado",
    order: 4,
    label: "Modelo consolidado",
    status: "actual",
    description: "Ajuste y consolidación del modelo a partir de la validación.",
  },
  {
    id: "implementacion",
    order: 5,
    label: "Implementación",
    status: "actual",
    description: "Puesta en marcha del modelo en el contexto académico.",
  },
  {
    id: "medicion-mejora-continua",
    order: 6,
    label: "Medición y mejora continua",
    status: "futuro",
    description: "Seguimiento del modelo y ajustes orientados a su mejora continua.",
  },
];
