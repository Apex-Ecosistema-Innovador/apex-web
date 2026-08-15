import { useEffect, useRef, useState, type RefObject } from "react";

export interface UseInViewResult<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T | null>;
  isInView: boolean;
}

export function useInView<T extends HTMLElement = HTMLElement>(): UseInViewResult<T> {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}
