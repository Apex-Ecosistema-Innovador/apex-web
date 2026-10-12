import type { DocumentoLegal } from "./documento-legal";

export const reglamentos: Record<string, DocumentoLegal> = {
  "1.0": {
    version: "1.0",
    titulo: "Reglamento de la hackathon",
    borrador: true,
    secciones: [
      {
        titulo: "1. Objeto",
        parrafos: [
          "La hackathon es una competencia formativa del proyecto APEX: un espacio para aplicar lo aprendido, resolver retos en equipo y mejorar a partir de la retroalimentación.",
        ],
      },
      {
        titulo: "2. Quiénes pueden participar",
        parrafos: [
          "Pueden inscribirse estudiantes con correo institucional del Politécnico Colombiano Jaime Isaza Cadavid. La inscripción queda pendiente hasta que el comité organizador la apruebe.",
          "Cada persona puede tener una sola inscripción por evento y pertenecer a un solo equipo.",
        ],
      },
      {
        titulo: "3. Equipos",
        parrafos: [
          "El tamaño mínimo y máximo de los equipos lo define cada evento. Cada equipo pertenece a una categoría y tiene un capitán.",
          "La composición de los equipos se congela cuando inicia la fase de desarrollo.",
        ],
      },
      {
        titulo: "4. Fases del evento",
        parrafos: [
          "El evento avanza por fases: inscripciones, equipos, desarrollo, entregas cerradas, evaluación final y resultados. Lo que se puede hacer en cada momento depende de la fase en curso.",
        ],
      },
      {
        titulo: "5. Entregas y plazos",
        parrafos: [
          "El reloj del servidor es la única autoridad sobre el tiempo. El reloj de tu dispositivo no cuenta.",
          "La tolerancia de cierre es de 0 segundos: una entrega registrada después del cierre se rechaza.",
          "Cada entrega es una versión nueva e inmutable. La entrega oficial es la última versión registrada antes del cierre.",
        ],
      },
      {
        titulo: "6. Evaluación",
        parrafos: [
          "Los proyectos se evalúan con una rúbrica de criterios ponderados, con una escala de 1 a 5 y un descriptor escrito para cada nivel. La nota de cada jurado se normaliza a una escala de 0 a 100.",
          "Cada categoría tiene un panel fijo de jurados: todos los proyectos de una categoría son evaluados por el mismo panel.",
        ],
      },
      {
        titulo: "7. Desempate",
        parrafos: [
          "Si hay empate en la nota final, se resuelve en este orden: mayor nota en el criterio de desempate primario, luego en el secundario, luego en el terciario, luego la entrega oficial más temprana y, por último, la decisión del jurado principal con justificación escrita. El resultado muestra la razón del desempate.",
        ],
      },
      {
        titulo: "8. Descalificación",
        parrafos: [
          "Las causales de descalificación serán definidas por el comité organizador antes del evento y se publicarán en la versión definitiva de este reglamento.",
        ],
      },
    ],
  },
};
