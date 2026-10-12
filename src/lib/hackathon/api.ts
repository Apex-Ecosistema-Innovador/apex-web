import type { DetalleError, EventoPublico, ResultadoInscripcion, SolicitudInscripcion } from "./tipos";

const API_URL_POR_DEFECTO = "http://localhost:4000/api/v1";

export const urlApi = () => (process.env.NEXT_PUBLIC_API_URL ?? API_URL_POR_DEFECTO).replace(/\/$/, "");

export const origenApi = () => new URL(urlApi()).origin;

export const eventoConfigurado = () => process.env.NEXT_PUBLIC_EVENTO_ID?.trim() || null;

export class ErrorApi extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
    public readonly detalles?: DetalleError[],
  ) {
    super(mensaje);
  }
}

export class ErrorRed extends Error {
  constructor() {
    super("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }
}

interface RespuestaApi<T> {
  message?: string;
  payload: T;
}

async function solicitar<T>(ruta: string, opciones: RequestInit = {}): Promise<RespuestaApi<T>> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlApi()}${ruta}`, {
      ...opciones,
      headers: { "Content-Type": "application/json", ...opciones.headers },
    });
  } catch {
    throw new ErrorRed();
  }

  const cuerpo = (await respuesta.json().catch(() => ({}))) as {
    message?: string;
    details?: DetalleError[];
    payload?: T;
  };

  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      cuerpo.message ?? "Ocurrió un error inesperado. Inténtalo de nuevo.",
      Array.isArray(cuerpo.details) ? cuerpo.details : undefined,
    );
  }

  return { message: cuerpo.message, payload: cuerpo.payload as T };
}

export async function obtenerEvento(eventoId: string): Promise<EventoPublico | null> {
  try {
    const { payload } = await solicitar<EventoPublico>(`/eventos/${eventoId}`, { cache: "no-store" });
    return payload;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}

export async function registrarInscripcion(
  eventoId: string,
  solicitud: SolicitudInscripcion,
): Promise<ResultadoInscripcion> {
  const { payload } = await solicitar<ResultadoInscripcion>(`/eventos/${eventoId}/inscripciones`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
  return payload;
}

export async function verificarCorreo(token: string): Promise<void> {
  await solicitar<void>("/verificacion-correo", { method: "POST", body: JSON.stringify({ token }) });
}

export async function reenviarVerificacion(correo: string): Promise<string> {
  const { message } = await solicitar<void>("/verificacion-correo/reenvio", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
  return message ?? "Si el correo está registrado, te enviamos un nuevo enlace.";
}
