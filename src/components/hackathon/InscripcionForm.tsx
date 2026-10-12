"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Aviso } from "@/components/hackathon/Aviso";
import { CampoCasilla, CampoContrasena, CampoSeleccion, CampoTexto } from "@/components/hackathon/campos";
import { InscripcionRegistrada } from "@/components/hackathon/InscripcionRegistrada";
import { ErrorApi, registrarInscripcion } from "@/lib/hackathon/api";
import {
  CONTRASENA_MINIMA,
  DOMINIO_CORREO,
  INSTITUCION_POR_DEFECTO,
  SEMESTRES,
  esquemaInscripcion,
  type DatosInscripcion,
  type EntradaInscripcion,
} from "@/lib/hackathon/esquema";
import type { EventoPublico, SolicitudInscripcion } from "@/lib/hackathon/tipos";

interface InscripcionFormProps {
  evento: EventoPublico;
}

const CAMPOS = [
  "nombre",
  "correo",
  "contrasena",
  "github",
  "linkedin",
  "portafolio",
  "institucion",
  "programa",
  "semestre",
  "aceptaReglamento",
  "autorizaTratamientoDatos",
] as const;

type Campo = (typeof CAMPOS)[number];

const esCampo = (valor: string): valor is Campo => (CAMPOS as readonly string[]).includes(valor);

const claseLeyenda = "font-mono text-xs uppercase tracking-widest text-accent md:text-sm";

const enlaceLegal =
  "text-accent underline underline-offset-4 hover:text-accent-alt focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function InscripcionForm({ evento }: InscripcionFormProps) {
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntradaInscripcion, unknown, DatosInscripcion>({
    resolver: zodResolver(esquemaInscripcion),
    defaultValues: {
      institucion: INSTITUCION_POR_DEFECTO,
      aceptaReglamento: false,
      autorizaTratamientoDatos: false,
      consientePublicacionImagen: false,
    },
  });

  async function alEnviar(datos: DatosInscripcion) {
    setErrorGeneral(null);

    const solicitud: SolicitudInscripcion = {
      nombre: datos.nombre,
      correo: datos.correo,
      contrasena: datos.contrasena,
      github: datos.github || undefined,
      linkedin: datos.linkedin || undefined,
      portafolio: datos.portafolio || undefined,
      institucion: datos.institucion,
      programa: datos.programa,
      semestre: datos.semestre,
      versionReglamento: evento.versionReglamento,
      aceptaReglamento: true,
      versionDatos: evento.versionAutorizacionDatos,
      autorizaTratamientoDatos: true,
      consientePublicacionImagen: datos.consientePublicacionImagen,
    };

    try {
      await registrarInscripcion(evento.id, solicitud);
      setRegistrado(datos.correo);
    } catch (error) {
      if (error instanceof ErrorApi && error.detalles?.length) {
        let ubicados = 0;
        for (const detalle of error.detalles) {
          const campo = detalle.path.split(".")[0];
          if (esCampo(campo)) {
            setError(campo, { message: detalle.message });
            ubicados += 1;
          }
        }
        if (ubicados === 0) setErrorGeneral(error.message);
        return;
      }
      if (error instanceof ErrorApi && error.estado === 409 && /correo/i.test(error.message)) {
        setError("correo", { message: error.message });
        return;
      }
      setErrorGeneral(error instanceof Error ? error.message : "No pudimos registrar tu inscripción.");
    }
  }

  if (registrado) return <InscripcionRegistrada correo={registrado} />;

  return (
    <form
      onSubmit={handleSubmit(alEnviar)}
      noValidate
      className="flex flex-col gap-10 rounded-xl border border-subtle bg-surface p-6 md:p-8"
    >
      {errorGeneral ? <Aviso tono="error">{errorGeneral}</Aviso> : null}

      <fieldset className="flex flex-col gap-5">
        <legend className={`${claseLeyenda} mb-5`}>01 · Tu cuenta</legend>
        <CampoTexto
          etiqueta="Nombre completo"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register("nombre")}
        />
        <CampoTexto
          etiqueta="Correo institucional"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={`nombre@${DOMINIO_CORREO}`}
          ayuda="Te enviaremos un enlace para verificarlo. No se aceptan correos personales."
          error={errors.correo?.message}
          {...register("correo")}
        />
        <CampoContrasena
          etiqueta="Contraseña"
          autoComplete="new-password"
          ayuda={`Mínimo ${CONTRASENA_MINIMA} caracteres.`}
          error={errors.contrasena?.message}
          {...register("contrasena")}
        />
        <CampoContrasena
          etiqueta="Confirma la contraseña"
          autoComplete="new-password"
          error={errors.confirmacion?.message}
          {...register("confirmacion")}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={`${claseLeyenda} mb-5`}>02 · Tu perfil (opcional)</legend>
        <p className="font-body text-sm text-secondary">
          Estos datos ayudan al jurado y a tu equipo a conocerte. Puedes dejarlos vacíos.
        </p>
        <CampoTexto
          etiqueta="Usuario de GitHub"
          opcional
          autoComplete="off"
          placeholder="tu-usuario"
          ayuda="Solo el usuario, sin @ ni enlace."
          error={errors.github?.message}
          {...register("github")}
        />
        <CampoTexto
          etiqueta="Perfil de LinkedIn"
          opcional
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://www.linkedin.com/in/tu-perfil"
          error={errors.linkedin?.message}
          {...register("linkedin")}
        />
        <CampoTexto
          etiqueta="Portafolio"
          opcional
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://tu-sitio.dev"
          error={errors.portafolio?.message}
          {...register("portafolio")}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={`${claseLeyenda} mb-5`}>03 · Tu contexto académico</legend>
        <CampoTexto
          etiqueta="Institución"
          autoComplete="organization"
          error={errors.institucion?.message}
          {...register("institucion")}
        />
        <CampoTexto
          etiqueta="Programa académico"
          autoComplete="off"
          error={errors.programa?.message}
          {...register("programa")}
        />
        <CampoSeleccion
          etiqueta="Semestre"
          marcador="Selecciona tu semestre"
          opciones={SEMESTRES.map((semestre) => ({ valor: semestre, texto: `Semestre ${semestre}` }))}
          error={errors.semestre?.message}
          {...register("semestre", { valueAsNumber: true })}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={`${claseLeyenda} mb-5`}>04 · Reglamento y datos</legend>
        <CampoCasilla error={errors.aceptaReglamento?.message} {...register("aceptaReglamento")}>
          Acepto el{" "}
          <a href="/hackathon/reglamento" target="_blank" rel="noopener noreferrer" className={enlaceLegal}>
            reglamento de la hackathon (versión {evento.versionReglamento})
          </a>
          .
        </CampoCasilla>
        <CampoCasilla error={errors.autorizaTratamientoDatos?.message} {...register("autorizaTratamientoDatos")}>
          Autorizo el tratamiento de mis datos personales según la{" "}
          <a href="/hackathon/autorizacion-datos" target="_blank" rel="noopener noreferrer" className={enlaceLegal}>
            autorización de tratamiento de datos (versión {evento.versionAutorizacionDatos})
          </a>
          .
        </CampoCasilla>
        <CampoCasilla {...register("consientePublicacionImagen")}>
          <span className="text-secondary">(Opcional)</span> Autorizo que mi imagen se publique en los resultados
          públicos y en las redes sociales de APEX. Participar no depende de esta autorización.
        </CampoCasilla>
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto md:self-start">
        {isSubmitting ? "Enviando…" : "Inscribirme"}
      </Button>
    </form>
  );
}
