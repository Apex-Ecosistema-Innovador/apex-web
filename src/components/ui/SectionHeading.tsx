interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 text-left">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-widest text-accent md:text-sm">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-medium md:text-5xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl font-body text-secondary md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
