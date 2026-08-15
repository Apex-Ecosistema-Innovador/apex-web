import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
      {children}
    </div>
  );
}
