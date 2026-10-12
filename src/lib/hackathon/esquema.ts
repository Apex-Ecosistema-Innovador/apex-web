import { z } from "zod";

z.config({ jitless: true });

export const DOMINIO_CORREO = "elpoli.edu.co";
export const CONTRASENA_MINIMA = 8;
export const INSTITUCION_POR_DEFECTO = "Politécnico Colombiano Jaime Isaza Cadavid";
export const SEMESTRES = Array.from({ length: 12 }, (_, indice) => indice + 1);

const NOMBRE = /^[\p{L}][\p{L}\s'.-]*$/u;
const USUARIO_GITHUB = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

const esUrlHttps = (valor: string) => {
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
};

const esLinkedin = (valor: string) => {
  const anfitrion = new URL(valor).hostname.toLowerCase();
  return anfitrion === "linkedin.com" || anfitrion.endsWith(".linkedin.com");
};

const opcional = (esquema: z.ZodType<string>) =>
  z
    .string()
    .trim()
    .superRefine((valor, contexto) => {
      if (valor === "") return;
      const resultado = esquema.safeParse(valor);
      if (!resultado.success) {
        contexto.addIssue({ code: "custom", message: resultado.error.issues[0].message });
      }
    });

const textoContexto = (etiqueta: string) =>
  z
    .string()
    .trim()
    .min(2, `Ingresa ${etiqueta}`)
    .max(150, "Máximo 150 caracteres");

export const esquemaInscripcion = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "Ingresa tu nombre completo")
      .max(150, "Máximo 150 caracteres")
      .regex(NOMBRE, "El nombre solo puede tener letras y espacios"),
    correo: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Ingresa tu correo institucional")
      .max(254, "Máximo 254 caracteres")
      .pipe(z.email("Ingresa un correo válido"))
      .refine((valor) => valor.endsWith(`@${DOMINIO_CORREO}`), `Usa tu correo institucional (@${DOMINIO_CORREO})`),
    contrasena: z
      .string()
      .min(CONTRASENA_MINIMA, `Mínimo ${CONTRASENA_MINIMA} caracteres`)
      .max(100, "Máximo 100 caracteres"),
    confirmacion: z.string(),
    github: opcional(
      z.string().regex(USUARIO_GITHUB, "Ingresa solo tu usuario de GitHub, sin @ ni enlace"),
    ),
    linkedin: opcional(
      z
        .string()
        .max(255)
        .refine(esUrlHttps, "Ingresa un enlace que empiece por https://")
        .refine((valor) => esUrlHttps(valor) && esLinkedin(valor), "Ingresa el enlace de tu perfil de LinkedIn"),
    ),
    portafolio: opcional(
      z.string().max(255).refine(esUrlHttps, "Ingresa un enlace que empiece por https://"),
    ),
    institucion: textoContexto("tu institución"),
    programa: textoContexto("tu programa académico"),
    semestre: z
      .number({ error: "Selecciona tu semestre" })
      .int("Selecciona tu semestre")
      .min(1, "Selecciona tu semestre")
      .max(12, "Selecciona tu semestre"),
    aceptaReglamento: z.boolean().refine((valor) => valor, "Debes aceptar el reglamento para inscribirte"),
    autorizaTratamientoDatos: z
      .boolean()
      .refine((valor) => valor, "Debes autorizar el tratamiento de tus datos para inscribirte"),
    consientePublicacionImagen: z.boolean(),
  })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    path: ["confirmacion"],
    error: "Las contraseñas no coinciden",
  });

export type EntradaInscripcion = z.input<typeof esquemaInscripcion>;
export type DatosInscripcion = z.output<typeof esquemaInscripcion>;

export const correoInstitucionalValido = (correo: string) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .refine((valor) => valor.endsWith(`@${DOMINIO_CORREO}`))
    .safeParse(correo).success;
