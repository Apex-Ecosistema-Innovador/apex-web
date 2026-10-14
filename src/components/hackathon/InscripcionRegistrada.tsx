"use client";

import { useEffect, useRef } from "react";
import { ReenviarVerificacion } from "@/components/hackathon/ReenviarVerificacion";

interface InscripcionRegistradaProps {
  correo: string;
}

const pasos = [
  "Abre el enlace que te enviamos y verifica tu correo.",
  "El comité organizador revisa tu inscripción.",
  "Te avisaremos por correo cuando haya una decisión.",
];

export function InscripcionRegistrada({ correo }: InscripcionRegistradaProps) {
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titulo.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-principal bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent md:text-sm">Estado: pendiente</p>
        <h2 ref={titulo} tabIndex={-1} className="font-display text-3xl font-medium outline-none md:text-5xl">
          Recibimos tu inscripción
        </h2>
        <p className="font-body text-secondary md:text-lg">
          Te enviamos un correo a <span className="font-medium text-primary">{correo}</span> desde{" "}
          <span className="font-medium text-primary">apex.ecosistema.noreply@gmail.com</span>. Si no lo ves en tu bandeja
          de entrada, busca en la carpeta de spam o correo no deseado.
        </p>
      </div>
      <ol className="flex flex-col gap-3 font-body text-base">
        {pasos.map((paso, indice) => (
          <li key={paso} className="flex gap-3">
            <span className="font-mono text-sm text-accent">{String(indice + 1).padStart(2, "0")}</span>
            <span>{paso}</span>
          </li>
        ))}
      </ol>
      <ReenviarVerificacion correo={correo} />
    </div>
  );
}
