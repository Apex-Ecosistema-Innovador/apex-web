import type { DocumentoLegal } from "@/content/hackathon/documento-legal";
import { autorizacionesDatos } from "@/content/hackathon/autorizacion-datos";
import { reglamentos } from "@/content/hackathon/reglamento";
import { eventoConfigurado, obtenerEvento } from "./api";

const masReciente = (documentos: Record<string, DocumentoLegal>): DocumentoLegal => {
  const versiones = Object.keys(documentos).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return documentos[versiones[versiones.length - 1]];
};

async function versionesVigentes() {
  const eventoId = eventoConfigurado();
  if (!eventoId) return null;
  try {
    return await obtenerEvento(eventoId);
  } catch {
    return null;
  }
}

export async function reglamentoVigente(): Promise<DocumentoLegal> {
  const evento = await versionesVigentes();
  return (evento && reglamentos[evento.versionReglamento]) || masReciente(reglamentos);
}

export async function autorizacionDatosVigente(): Promise<DocumentoLegal> {
  const evento = await versionesVigentes();
  return (evento && autorizacionesDatos[evento.versionAutorizacionDatos]) || masReciente(autorizacionesDatos);
}
