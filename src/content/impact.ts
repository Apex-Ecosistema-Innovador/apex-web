export interface ImpactStatement {
  id: string;
  title: string;
  description: string;
}

export const impact: ImpactStatement[] = [
  {
    id: "aprender-mejor",
    title: "Aprender mejor",
    description:
      "Busca fortalecer el pensamiento lógico y computacional como base antes que la sintaxis.",
  },
  {
    id: "frustrarse-menos",
    title: "Frustrarse menos",
    description:
      "Está orientado a construir mejores rutas de acompañamiento frente a las dificultades del aprendizaje.",
  },
  {
    id: "competir-mas",
    title: "Competir más",
    description:
      "Pretende crear condiciones para la participación en retos, hackatones y maratones de programación.",
  },
  {
    id: "construir-talento",
    title: "Construir talento",
    description:
      "Busca sentar las bases para identificar y potenciar capacidades de programación competitiva.",
  },
];
