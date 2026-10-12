import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/layout/Footer";

export function HackathonShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-subtle">
        <Container>
          <nav className="flex items-center justify-between gap-4 py-4" aria-label="Principal">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Image src="/brand/logo.png" alt="" width={701} height={653} className="h-7 w-auto object-contain" />
              <Image
                src="/brand/wordmark.png"
                alt="APEX, ir al inicio"
                width={1536}
                height={1024}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <Link
              href="/"
              className="font-body text-sm text-secondary transition-colors duration-(--duration-fast) ease-default hover:text-accent focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Volver al sitio
            </Link>
          </nav>
        </Container>
      </header>
      <main className="flex-1 py-12 md:py-20">{children}</main>
      <Footer />
    </>
  );
}
