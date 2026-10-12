import { Aviso } from "@/components/hackathon/Aviso";
import { AVISO_BORRADOR, type DocumentoLegal } from "@/content/hackathon/documento-legal";

export function DocumentoLegalVista({ documento }: { documento: DocumentoLegal }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent md:text-sm">
          Versión {documento.version}
        </p>
        <h1 className="font-display text-3xl font-medium md:text-5xl">{documento.titulo}</h1>
      </header>
      {documento.borrador ? <Aviso tono="info">{AVISO_BORRADOR}</Aviso> : null}
      {documento.secciones.map((seccion) => (
        <section key={seccion.titulo} className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-medium md:text-2xl">{seccion.titulo}</h2>
          {seccion.parrafos.map((parrafo) => (
            <p key={parrafo} className="font-body text-base text-secondary md:text-lg">
              {parrafo}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
