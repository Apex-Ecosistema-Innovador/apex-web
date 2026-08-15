export interface Stat {
  id: string;
  value: string;
  label: string;
  source: string;
}

export const stats: Stat[] = [
  {
    id: "reprobacion-cursos-introductorios",
    value: "30%–60%",
    label: "Reprobación en cursos introductorios de programación en Latinoamérica",
    source: "Vega & Hernández, 2022",
  },
  {
    id: "desercion-ingenieria-colombia",
    value: "+45%",
    label: "Deserción en programas de ingeniería en Colombia, concentrada en primeros semestres",
    source: "Observatorio Laboral para la Educación",
  },
  {
    id: "desercion-programacion-introductoria",
    value: "35%–55%",
    label: "Deserción por asignatura en programación introductoria en instituciones públicas colombianas",
    source: "Correa, Pérez & Vega, 2021",
  },
];
