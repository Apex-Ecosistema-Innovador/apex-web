import type { FaseHackathon } from "@/lib/hackathon/tipos";

export const etiquetasFase: Record<FaseHackathon, string> = {
  BORRADOR: "En preparación",
  INSCRIPCIONES: "Inscripciones abiertas",
  EQUIPOS: "Conformación de equipos",
  DESARROLLO: "Desarrollo",
  ENTREGAS_CERRADAS: "Entregas cerradas",
  PRESELECCION: "Evaluación",
  FINAL: "Evaluación final",
  RESULTADOS: "Resultados",
  ARCHIVADO: "Finalizado",
  CANCELADO: "Cancelado",
};
