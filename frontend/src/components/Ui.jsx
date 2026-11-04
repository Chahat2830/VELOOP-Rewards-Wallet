
import React from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="page-intro ui-animate">
      <div>
        <div className="eyebrow">
          <span className="live-dot" />
          {eyebrow}
        </div>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      {action && (
        <div className="page-intro-action">
          {action}
        </div>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
  delay = 0,
}) {
  return (
    <section
      className={`glass-card ui-animate ${className}`}
      style={{
        "--animation-delay": `${delay}s`,
      }}
    >
      {children}
    </section>
  );
}

export function Loading({
  text = "Syncing with VELOOP ledger...",
}) {
  return (
    <div className="loading-state">
      <span className="loader-ring" />
      <span>{text}</span>
    </div>
  );
}

export function Alert({ error, success }) {
  return (
    <>
      {error && (
        <div
          className="alert error-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="alert success-alert"
          role="status"
        >
          {success}
        </div>
      )}
    </>
  );
}
