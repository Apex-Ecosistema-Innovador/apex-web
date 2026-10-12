"use client";

import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, useId, useState } from "react";
import { cn } from "@/lib/cn";

const claseControl =
  "w-full rounded-lg border bg-surface px-4 py-3 font-body text-base text-primary placeholder:text-secondary transition-colors duration-(--duration-fast) ease-default hover:border-principal focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

interface EnvoltorioProps {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  children: (propiedades: { "aria-describedby"?: string; "aria-invalid": boolean }) => ReactNode;
}

function Envoltorio({ id, etiqueta, ayuda, error, opcional, children }: EnvoltorioProps) {
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const descripcion = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-body text-sm font-medium text-primary">
        {etiqueta}
        {opcional ? <span className="ml-2 font-normal text-secondary">(opcional)</span> : null}
      </label>
      {children({ "aria-describedby": descripcion, "aria-invalid": Boolean(error) })}
      {ayuda ? (
        <p id={idAyuda} className="font-body text-sm text-secondary">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idError} role="alert" className="font-body text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
}

export function CampoTexto({ etiqueta, ayuda, error, opcional, className, ...resto }: CampoTextoProps) {
  const id = useId();
  return (
    <Envoltorio id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional}>
      {(aria) => (
        <input
          id={id}
          className={cn(claseControl, error ? "border-danger" : "border-default", className)}
          {...aria}
          {...resto}
        />
      )}
    </Envoltorio>
  );
}

export function CampoContrasena({ etiqueta, ayuda, error, className, ...resto }: CampoTextoProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <Envoltorio id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      {(aria) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            className={cn(claseControl, "pr-12", error ? "border-danger" : "border-default", className)}
            {...aria}
            {...resto}
          />
          <button
            type="button"
            onClick={() => setVisible((actual) => !actual)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-lg text-secondary transition-colors duration-(--duration-fast) ease-default hover:text-primary focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {visible ? <path d="M4 20 20 4" /> : null}
            </svg>
          </button>
        </div>
      )}
    </Envoltorio>
  );
}

interface CampoSeleccionProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  marcador: string;
  opciones: { valor: number | string; texto: string }[];
}

export function CampoSeleccion({ etiqueta, ayuda, error, marcador, opciones, className, ...resto }: CampoSeleccionProps) {
  const id = useId();
  return (
    <Envoltorio id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      {(aria) => (
        <select
          id={id}
          defaultValue=""
          className={cn(claseControl, "appearance-none", error ? "border-danger" : "border-default", className)}
          {...aria}
          {...resto}
        >
          <option value="" disabled>
            {marcador}
          </option>
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      )}
    </Envoltorio>
  );
}

interface CampoCasillaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
  error?: string;
}

export function CampoCasilla({ children, error, className, ...resto }: CampoCasillaProps) {
  const id = useId();
  const idError = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? idError : undefined}
          className={cn(
            "mt-1 size-5 shrink-0 cursor-pointer rounded accent-brand-green-light focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            className,
          )}
          {...resto}
        />
        <label htmlFor={id} className="cursor-pointer font-body text-base text-primary">
          {children}
        </label>
      </div>
      {error ? (
        <p id={idError} role="alert" className="font-body text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
