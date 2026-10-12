import { describe, expect, it } from "vitest";
import { correoInstitucionalValido, esquemaInscripcion } from "./esquema";

const valido = {
  nombre: "Ana María Gómez",
  correo: "Ana.Gomez@elpoli.edu.co",
  contrasena: "clave-segura-1",
  confirmacion: "clave-segura-1",
  github: "",
  linkedin: "",
  portafolio: "",
  institucion: "Politécnico Colombiano Jaime Isaza Cadavid",
  programa: "Ingeniería Informática",
  semestre: 4,
  aceptaReglamento: true,
  autorizaTratamientoDatos: true,
  consientePublicacionImagen: false,
};

const mensajes = (entrada: Record<string, unknown>) => {
  const resultado = esquemaInscripcion.safeParse({ ...valido, ...entrada });
  return resultado.success ? [] : resultado.error.issues.map((incidencia) => incidencia.message);
};

describe("esquema de inscripción", () => {
  it("acepta una inscripción completa y normaliza el correo a minúsculas", () => {
    const resultado = esquemaInscripcion.parse(valido);

    expect(resultado.correo).toBe("ana.gomez@elpoli.edu.co");
  });

  it("rechaza correos que no son institucionales", () => {
    expect(mensajes({ correo: "ana@gmail.com" })).toContain("Usa tu correo institucional (@elpoli.edu.co)");
    expect(mensajes({ correo: "ana@elpoli.edu.co.evil.com" })).not.toEqual([]);
    expect(mensajes({ correo: "no-es-correo" })).not.toEqual([]);
  });

  it("exige que la confirmación de la contraseña coincida", () => {
    expect(mensajes({ confirmacion: "otra-clave-123" })).toContain("Las contraseñas no coinciden");
  });

  it("exige una contraseña de al menos 8 caracteres", () => {
    expect(mensajes({ contrasena: "corta", confirmacion: "corta" })).toContain("Mínimo 8 caracteres");
  });

  it("rechaza nombres con números o símbolos", () => {
    expect(mensajes({ nombre: "Ana 2" })).toContain("El nombre solo puede tener letras y espacios");
    expect(mensajes({ nombre: "A" })).toContain("Ingresa tu nombre completo");
  });

  it("limita el semestre a un entero entre 1 y 12", () => {
    expect(mensajes({ semestre: 0 })).not.toEqual([]);
    expect(mensajes({ semestre: 13 })).not.toEqual([]);
    expect(mensajes({ semestre: 2.5 })).not.toEqual([]);
    expect(mensajes({ semestre: Number.NaN })).toContain("Selecciona tu semestre");
  });

  it("exige aceptar el reglamento y autorizar los datos por separado", () => {
    expect(mensajes({ aceptaReglamento: false })).toContain("Debes aceptar el reglamento para inscribirte");
    expect(mensajes({ autorizaTratamientoDatos: false })).toContain(
      "Debes autorizar el tratamiento de tus datos para inscribirte",
    );
  });

  it("no exige el consentimiento de imagen", () => {
    expect(mensajes({ consientePublicacionImagen: false })).toEqual([]);
  });

  it("valida el perfil opcional solo cuando se escribe", () => {
    expect(mensajes({ github: "ana-gomez", linkedin: "https://www.linkedin.com/in/ana", portafolio: "https://ana.dev" })).toEqual([]);
    expect(mensajes({ github: "https://github.com/ana" })).toContain("Ingresa solo tu usuario de GitHub, sin @ ni enlace");
    expect(mensajes({ linkedin: "https://example.com/in/ana" })).toContain("Ingresa el enlace de tu perfil de LinkedIn");
    expect(mensajes({ linkedin: "http://linkedin.com/in/ana" })).toContain("Ingresa un enlace que empiece por https://");
    expect(mensajes({ portafolio: "javascript:alert(1)" })).toContain("Ingresa un enlace que empiece por https://");
  });
});

describe("correo institucional", () => {
  it("acepta solo el dominio del Politécnico", () => {
    expect(correoInstitucionalValido("ana@elpoli.edu.co")).toBe(true);
    expect(correoInstitucionalValido("ana@gmail.com")).toBe(false);
  });
});
