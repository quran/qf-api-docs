import React from "react";
import clsx from "clsx";
import { copyToClipboard } from "@site/src/lib/clipboard";
import { NEXT_JS_STARTER_COMMAND } from "@site/src/lib/onboarding";
import styles from "./styles.module.css";

type Props = {
  className?: string;
  description?: string;
  eyebrow?: string;
  headingLevel?: "h2" | "h3";
  meta?: string;
  title?: string;
};

export default function StarterCommandCard({
  className,
  description = "Customize a starter with Quran ID sign-in, a reader, notes, and bookmarks already connected.",
  eyebrow = "Next.js starter",
  headingLevel: Heading = "h2",
  meta,
  title = "Start with a working Next.js app",
}: Props): JSX.Element {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimeoutRef = React.useRef<number | undefined>();

  React.useEffect(
    () => () => {
      if (resetTimeoutRef.current !== undefined) {
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

    if (resetTimeoutRef.current !== undefined) {
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
          <Heading className={styles.title}>{title}</Heading>
        </div>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </div>
      <p className={styles.description}>{description}</p>
      <p className={styles.prerequisite}>
        First, create a{" "}
        <a href="https://dev-console.quran.foundation/projects/new">
          Backend/server app in Developer Console
        </a>{" "}
        and save its client secret. The starter’s search feature needs separate
        pre-live permission.
      </p>
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
      <p className={styles.copyStatus} aria-live="polite">
        {copyState === "failed" ? "Copy failed. Select the command manually." : ""}
      </p>
    </div>
  );
}
