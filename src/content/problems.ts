export interface Problem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const problems: Problem[] = [
  {
    id: "ensenanza-tradicional",
    number: "01",
    title: "FORTALECER LA FORMA DE APRENDER",
    description:
      "La enseñanza en algoritmos y programación tiende a priorizar la sintaxis y la transmisión teórica por encima del pensamiento computacional y la resolución estructurada de problemas.",
  },
  {
    id: "poca-experimentacion-colaborativa",
    number: "02",
    title: "ESTUDIAR JUNTOS",
    description:
      "Existen pocos espacios sistemáticos para el trabajo en equipo, los retos compartidos y la competencia formativa dentro del aula.",
  },
  {
    id: "talento-desapercibido",
    number: "03",
    title: "POTENCIAR EL TALENTO",
    description:
      "No existe actualmente una ruta institucional estructurada para identificar, fortalecer y proyectar a estudiantes con potencial hacia la programación competitiva.",
  },
  {
    id: "uso-prematuro-ia-generativa",
    number: "04",
    title: "APRENDER MEJOR A USAR LA IA",
    description:
      "Aunque es muy importante, en un inicio la IA en las etapas fundacionales del desarrollo lógico puede interferir con el proceso de abstracción autónoma del estudiante.",
  },
];
