export interface SeccionLegal {
  titulo: string;
  parrafos: string[];
}

export interface DocumentoLegal {
  version: string;
  titulo: string;
  borrador: boolean;
  secciones: SeccionLegal[];
}

export const AVISO_BORRADOR =
  "Texto provisional. El comité organizador y la oficina jurídica del Politécnico deben revisarlo y aprobarlo antes de abrir las inscripciones al público.";
