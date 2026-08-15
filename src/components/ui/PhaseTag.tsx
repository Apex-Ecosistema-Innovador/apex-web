import { Badge } from "@/components/ui/Badge";

interface PhaseTagProps {
  status: "actual" | "futuro";
  label: string;
}

export function PhaseTag({ status, label }: PhaseTagProps) {
  return (
    <Badge
      className={
        status === "actual" ? "border-principal text-accent" : "text-muted"
      }
    >
      <span aria-hidden="true">{status === "actual" ? "●" : "○"}</span> {label}
    </Badge>
  );
}
