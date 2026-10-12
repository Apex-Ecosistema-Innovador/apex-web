import type { Metadata } from "next";
import { connection } from "next/server";
import { Container } from "@/components/layout/Container";
import { HackathonShell } from "@/components/hackathon/HackathonShell";
import { VerificarCorreo } from "@/components/hackathon/VerificarCorreo";

export const metadata: Metadata = {
  title: "Verificar correo · APEX",
  robots: { index: false },
};

export default async function PaginaVerificarCorreo() {
  await connection();

  return (
    <HackathonShell>
      <Container>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">Verifica tu correo</h1>
          <VerificarCorreo />
        </div>
      </Container>
    </HackathonShell>
  );
}
