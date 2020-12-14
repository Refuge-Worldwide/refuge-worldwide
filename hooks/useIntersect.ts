import { useEffect, useRef, useState } from "react";

export default function useIntersect({
  root = null,
  rootMargin,
  threshold = 0,
}: {
  root?: Element;
  rootMargin?: string;
  threshold: number | number[];
}) {
  const [entry, updateEntry] = useState<IntersectionObserverEntry>(null);
  const [node, setNode] = useState<Element>(null);

  const observer = useRef<IntersectionObserver>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new window.IntersectionObserver(
      ([entry]) => updateEntry(entry),
      {
        root,
        rootMargin,
        threshold,
      }
    );

    const { current: currentObserver } = observer;

    if (node) currentObserver.observe(node);

    return () => currentObserver.disconnect();
  }, [node, root, rootMargin, threshold]);

  return { setNode, entry };
}
