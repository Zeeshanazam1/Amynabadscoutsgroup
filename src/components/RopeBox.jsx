import React from "react";
import "./RopeBox.css";

/**
 * RopeBox
 * Subtle, modern rope-style container.
 * Uses corner ornaments + thin border/shadow instead of full "scrapbook" borders.
 */
export default function RopeBox({
  title,
  children,
  className = "",
  variant = "info", // info | neutral | accent
}) {
  return (
    <div className={`rope-box rope-box--${variant} ${className}`.trim()}>
      {title ? (
        <div className="rope-box__header">
          <div className="rope-box__corner knot" aria-hidden="true" />
          <h3 className="rope-box__title">{title}</h3>
          <div className="rope-box__corner knot" aria-hidden="true" />
        </div>
      ) : null}

      <div className="rope-box__body">{children}</div>

      {/* purely decorative corners */}
      <span className="rope-box__corner rope rope--tl" aria-hidden="true" />
      <span className="rope-box__corner rope rope--tr" aria-hidden="true" />
      <span className="rope-box__corner rope rope--bl" aria-hidden="true" />
      <span className="rope-box__corner rope rope--br" aria-hidden="true" />
    </div>
  );
}

