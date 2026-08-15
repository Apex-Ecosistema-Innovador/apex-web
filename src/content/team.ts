export interface TeamMember {
  id: string;
  name: string;
  role: string;
  group: "investigacion" | "estudiantes";
  /**
   * Ruta a la foto de la persona, ej. "/team/claudia-rosero.jpg".
   * Para agregarla: coloca el archivo de imagen en public/team/ y escribe
   * aquí su ruta. Mientras el campo quede sin definir, la card muestra un
   * placeholder con las iniciales de la persona.
   */
  photo?: string;
}

export const team: TeamMember[] = [
  {
    id: "claudia-alejandra-rosero-noguera",
    name: "Claudia Alejandra Rosero Noguera",
    role: "Investigadora principal",
    group: "investigacion",
  },
  {
    id: "jonattan-usma-vasquez",
    name: "Jonattan Usma Vasquez",
    role: "Coinvestigador",
    group: "investigacion",
  },
  {
    id: "david-cordoba-pimienta",
    name: "David Cordoba Pimienta",
    role: "Coinvestigador",
    group: "investigacion",
  },
  {
    id: "luis-fernando-galvan-gomez",
    name: "Luis Fernando Galván Gómez",
    role: "Coinvestigador",
    group: "investigacion",
  },
  {
    id: "luis-fernando-gonzalez-alvaran",
    name: "Luis Fernando González Alvarán",
    role: "Coinvestigador",
    group: "investigacion",
  },
  {
    id: "brayhan-alexander-escobar-rivera",
    name: "Brayhan Alexander Escobar Rivera",
    role: "Estudiante investigador",
    group: "estudiantes",
  },
  {
    id: "camilo-gomez-rendon",
    name: "Camilo Gómez Rendon",
    role: "Estudiante investigador",
    group: "estudiantes",
  },
];
