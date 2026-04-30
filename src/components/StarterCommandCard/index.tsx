import React from "react";
import clsx from "clsx";
import { copyToClipboard } from "@site/src/lib/clipboard";
import { NEXT_JS_STARTER_COMMAND } from "@site/src/lib/onboarding";
import styles from "./styles.module.css";

type Props = {
  className?: string;
  description?: string;
  eyebrow?: string;
  meta?: string;
  title?: string;
};

export default function StarterCommandCard({
  className,
  description = "Includes OAuth2, reader, search, notes, bookmarks, and SDK wiring. Use this for the fastest working app. If you already have your own UI, start with the JavaScript SDK path below.",
  eyebrow = "Next.js starter",
  meta = "~5 min",
  title = "Production-shaped app in one command",
}: Props): JSX.Element {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimeoutRef = React.useRef<number | undefined>();

  React.useEffect(
    () => () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const handleCopyCommand = React.useCallback(async () => {
    try {
      await copyToClipboard(NEXT_JS_STARTER_COMMAND);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopyState("idle");
    }, 2500);
  }, []);

  return (
    <div className={clsx(styles.card, className)}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </div>
      <div className={styles.commandRow}>
        <code className={styles.command}>{NEXT_JS_STARTER_COMMAND}</code>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyCommand}
        >
          {copyState === "copied" ? "Copied" : "Copy command"}
        </button>
      </div>
      <p className={styles.description}>{description}</p>
      <p className={styles.copyStatus} aria-live="polite">
        {copyState === "failed" ? "Copy failed. Select the command manually." : ""}
      </p>
    </div>
  );
}
