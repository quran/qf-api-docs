import React from "react";
import clsx from "clsx";

import styles from "./DeveloperModal.module.css";

interface DeveloperModalProps {
  title: string;
  points: React.ReactNode[];
  ctaLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperModal({
  title,
  points,
  ctaLabel,
  isOpen,
  onClose,
}: DeveloperModalProps) {
  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={styles.modalCard}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <ul className={styles.modalList}>
          {points.map((point, index) => (
            <li key={`point-${index}`}>{point}</li>
          ))}
        </ul>
        <button
          type="button"
          className={clsx("button button--primary button--md", styles.modalCta)}
          onClick={onClose}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
