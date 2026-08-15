import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-subtle bg-surface">
      <Container>
        <div className="flex flex-col gap-1 py-8 font-body text-sm text-muted">
          <p className="font-medium text-secondary">
            APEX — Modelo metodológico para el fortalecimiento en el desempeño académico
            en programación y desarrollo de lógica en APIT
          </p>
          <p>Politécnico Colombiano Jaime Isaza Cadavid</p>
          <p>Facultad de Ingeniería · APIT</p>
          <p>GIS · SIIC</p>
        </div>
      </Container>
    </footer>
  );
}
