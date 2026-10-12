import type { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/components/layout/Container";
import { DocumentoLegalVista } from "@/components/hackathon/DocumentoLegalVista";
import { HackathonShell } from "@/components/hackathon/HackathonShell";
import { autorizacionDatosVigente } from "@/lib/hackathon/documentos";

export const metadata: Metadata = {
  title: "Autorización de tratamiento de datos · APEX",
};

export default async function PaginaAutorizacionDatos() {
  await connection();
  const documento = await autorizacionDatosVigente();

  return (
    <HackathonShell>
      <Container>
        <div className="mx-auto w-full max-w-2xl">
          <DocumentoLegalVista documento={documento} />
        </div>
      </Container>
    </HackathonShell>
  );
}
