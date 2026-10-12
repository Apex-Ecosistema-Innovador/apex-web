import type { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/components/layout/Container";
import { DocumentoLegalVista } from "@/components/hackathon/DocumentoLegalVista";
import { HackathonShell } from "@/components/hackathon/HackathonShell";
import { reglamentoVigente } from "@/lib/hackathon/documentos";

export const metadata: Metadata = {
  title: "Reglamento de la hackathon · APEX",
};

export default async function PaginaReglamento() {
  await connection();
  const documento = await reglamentoVigente();

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
