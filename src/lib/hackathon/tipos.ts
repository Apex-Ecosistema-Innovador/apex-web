export type FaseHackathon =
  | "BORRADOR"
  | "INSCRIPCIONES"
  | "EQUIPOS"
  | "DESARROLLO"
  | "ENTREGAS_CERRADAS"
  | "PRESELECCION"
  | "FINAL"
  | "RESULTADOS"
  | "ARCHIVADO"
  | "CANCELADO";

export interface EventoPublico {
  id: string;
  nombre: string;
  descripcion: string;
  modalidad: string;
  lugar: string;
  zonaHoraria: string;
  equipoMin: number;
  equipoMax: number;
  faseActual: FaseHackathon;
  inscripcionesAbiertas: boolean;
  versionReglamento: string;
  versionAutorizacionDatos: string;
}

export interface DetalleError {
  path: string;
  message: string;
}

export interface SolicitudInscripcion {
  nombre: string;
  correo: string;
  contrasena: string;
  github?: string;
  linkedin?: string;
  portafolio?: string;
  institucion: string;
  programa: string;
  semestre: number;
  versionReglamento: string;
  aceptaReglamento: true;
  versionDatos: string;
  autorizaTratamientoDatos: true;
  consientePublicacionImagen: boolean;
}

export interface ResultadoInscripcion {
  inscripcionId: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "EN_LISTA_ESPERA";
  correoVerificado: boolean;
}
