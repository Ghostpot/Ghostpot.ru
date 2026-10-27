import { useState } from "react";
import { media } from "@/data/content";

export function Shot({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) {
    return (
      <div className={`ph ${className ?? ""}`} aria-hidden="true">
        {(alt || "Л").slice(0, 1)}
      </div>
    );
  }
  return (
    <img
      src={media(src)}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}

export function markHot(mark: string) {
  return mark === "Сейчас" || mark === "Книга";
}
