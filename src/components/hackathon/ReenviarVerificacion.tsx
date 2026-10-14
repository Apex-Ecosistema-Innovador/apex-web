"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Aviso } from "@/components/hackathon/Aviso";
import { reenviarVerificacion } from "@/lib/hackathon/api";

interface ReenviarVerificacionProps {
  correo: string;
  etiqueta?: string;
  deshabilitado?: boolean;
}

type Estado = { tipo: "inactivo" } | { tipo: "enviando" } | { tipo: "listo"; mensaje: string } | { tipo: "error"; mensaje: string };

export function ReenviarVerificacion({
  correo,
  etiqueta = "Reenviar enlace de verificación",
  deshabilitado = false,
}: ReenviarVerificacionProps) {
  const [estado, setEstado] = useState<Estado>({ tipo: "inactivo" });

  async function reenviar() {
    setEstado({ tipo: "enviando" });
    try {
      setEstado({ tipo: "listo", mensaje: await reenviarVerificacion(correo) });
    } catch (error) {
      setEstado({ tipo: "error", mensaje: error instanceof Error ? error.message : "No pudimos reenviar el enlace." });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" onClick={reenviar} disabled={deshabilitado || estado.tipo === "enviando"} className="w-full md:w-auto">
        {estado.tipo === "enviando" ? "Enviando…" : etiqueta}
      </Button>
      {estado.tipo === "listo" ? (
        <Aviso tono="exito">
          {estado.mensaje} Si no aparece en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.
        </Aviso>
      ) : null}
      {estado.tipo === "error" ? <Aviso tono="error">{estado.mensaje}</Aviso> : null}
    </div>
  );
}
