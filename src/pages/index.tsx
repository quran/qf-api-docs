import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import DeveloperJourneyMap from "@site/src/components/DeveloperJourneyMap";

import styles from "./index.module.css";

const SCAFFOLD_COMMAND =
  "npx @quranjs/create-app@latest my-quran-app --template next --package-manager npm --install --git --sdk-source npm --yes";

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Copy command was rejected");
    }
  } finally {
    document.body.removeChild(textarea);
  }
};

function HomepageHeader() {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const resetTimeoutRef = React.useRef<number | undefined>();

  React.useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

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
      await copyText(SCAFFOLD_COMMAND);
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
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Quran.Foundation Documentation Portal
        </h1>
        <p className={styles.heroSubtitle}>
          Request access, pick the right integration path, and build with Quran
          Foundation APIs using the official docs, SDK, and starter app.
        </p>

        <div className={styles.heroButtonRow}>
          <Link
            className={clsx("button button--lg", styles.primaryButton)}
            to="/request-access"
          >
            Request Access
          </Link>
          <Link
            className={clsx("button button--lg", styles.outlineButton)}
            to="/docs/tutorials/oidc/starter-with-npx"
          >
            View Starter Guide
          </Link>
        </div>

        <div className={styles.scaffoldCard}>
          <div className={styles.scaffoldHeader}>
            <div>
              <p className={styles.scaffoldEyebrow}>Next.js starter</p>
              <h2 className={styles.scaffoldTitle}>
                Production-shaped app in one command
              </h2>
            </div>
            <span className={styles.scaffoldMeta}>~5 min</span>
          </div>
          <div className={styles.commandRow}>
            <code className={styles.command}>{SCAFFOLD_COMMAND}</code>
            <button
              type="button"
              className={styles.copyCommandButton}
              onClick={handleCopyCommand}
            >
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className={styles.scaffoldText}>
            Includes OAuth2, reader, search, notes, bookmarks, and the
            runtime-split JavaScript SDK. Use this when you want a working app
            before reading lower-level OAuth details.
          </p>
          <p className={styles.copyStatus} aria-live="polite">
            {copyState === "failed" ? "Copy failed. Select the command manually." : ""}
          </p>
        </div>

        <nav
          className={styles.heroResourceLinks}
          aria-label="Secondary developer resources"
        >
          <a href="/agent-prompts/qf-next-starter.md">AI starter prompt</a>
          <a href="/llms.txt">LLMs.txt</a>
          <a href="/docs/api-reference">API reference</a>
        </nav>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      description="QuranFoundation API Docs portal that will help Muslim developers get the Ummah closer to the Quran by seamlessly develop apps on top of Quran.Foundation's APIs."
    >
      <HomepageHeader />
      <main>
        <DeveloperJourneyMap variant="homepage" />
      </main>
    </Layout>
  );
}
