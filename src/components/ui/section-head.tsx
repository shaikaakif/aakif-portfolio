import type { ReactNode } from "react";

interface SectionHeadProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  side?: ReactNode;
  reveal?: boolean;
}

export function SectionHead({
  eyebrow,
  title,
  description,
  side,
  reveal = true,
}: SectionHeadProps) {
  return (
    <div className={`section-head${reveal ? " reveal" : ""}`}>
      <div className="section-head__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-title">{title}</h2>
        {description ? <p className="body-copy">{description}</p> : null}
      </div>
      {side ? <div className="section-head__side">{side}</div> : null}
    </div>
  );
}
