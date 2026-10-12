"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Aviso } from "@/components/hackathon/Aviso";
import { CampoTexto } from "@/components/hackathon/campos";
import { ReenviarVerificacion } from "@/components/hackathon/ReenviarVerificacion";
import { verificarCorreo } from "@/lib/hackathon/api";
import { correoInstitucionalValido } from "@/lib/hackathon/esquema";

type Estado =
  | { tipo: "verificando" }
  | { tipo: "verificado" }
  | { tipo: "fallo"; mensaje: string };

const PATRON_TOKEN = /[#&]token=([\w-]+)/;

function leerToken(): string | null {
  const token = PATRON_TOKEN.exec(window.location.hash)?.[1] ?? null;
  window.history.replaceState(null, "", window.location.pathname);
  return token;
}

export function VerificarCorreo() {
  const [estado, setEstado] = useState<Estado>({ tipo: "verificando" });
  const [correo, setCorreo] = useState("");
  const solicitud = useRef<Promise<Estado> | null>(null);

  useEffect(() => {
    let activo = true;
    if (!solicitud.current) {
      const token = leerToken();
      solicitud.current = token
        ? verificarCorreo(token).then(
            (): Estado => ({ tipo: "verificado" }),
            (error): Estado => ({
              tipo: "fallo",
              mensaje: error instanceof Error ? error.message : "No pudimos verificar tu correo.",
            }),
          )
        : Promise.resolve<Estado>({
            tipo: "fallo",
            mensaje: "El enlace no es válido. Solicita uno nuevo para verificar tu correo.",
          });
    }
    solicitud.current.then((resultado) => {
      if (activo) setEstado(resultado);
    });
    return () => {
      activo = false;
    };
  }, []);

  if (estado.tipo === "verificando") {
    return (
      <p role="status" className="font-body text-secondary md:text-lg">
        Verificando tu correo…
      </p>
    );
  }

  if (estado.tipo === "verificado") {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tono="exito">Tu correo quedó verificado.</Aviso>
        <p className="font-body text-secondary md:text-lg">
          Tu inscripción sigue pendiente de revisión por el comité organizador. Te avisaremos por correo cuando haya
          una decisión.
        </p>
        <Button href="/" variant="secondary" className="w-full md:w-auto">
          Volver al sitio
        </Button>
      </div>
    );
  }

  const correoValido = correoInstitucionalValido(correo);

  return (
    <div className="flex flex-col gap-6">
      <Aviso tono="error">{estado.mensaje}</Aviso>
      <div className="flex flex-col gap-4 rounded-xl border border-subtle bg-surface p-6">
        <h2 className="font-display text-xl font-medium md:text-2xl">Solicitar un enlace nuevo</h2>
        <CampoTexto
          etiqueta="Correo institucional"
          type="email"
          autoComplete="email"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
        <ReenviarVerificacion
          correo={correo.trim().toLowerCase()}
          etiqueta="Enviar enlace"
          deshabilitado={!correoValido}
        />
      </div>
    </div>
  );
}
