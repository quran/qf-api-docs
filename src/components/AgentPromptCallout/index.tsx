import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import { copyToClipboard } from "@site/src/lib/clipboard";

import styles from "./styles.module.css";

type PromptId = "QF_NPX_STARTER_PROMPT_V1";

type Props = {
  className?: string;
  promptId?: PromptId;
};

const PROMPTS: Record<
  PromptId,
  {
    command: string;
    description: string;
    docsUrl: string;
    label: string;
    promptText: string;
    promptUrl: string;
    title: string;
  }
> = {
  QF_NPX_STARTER_PROMPT_V1: {
    description:
      "Scaffold a production-shaped Next.js app with OAuth2, reader, search, notes, bookmarks, and the runtime-split Quran Foundation SDK.",
    command:
      "npx @quranjs/create-app@latest my-quran-app --template next --package-manager npm --install --git --sdk-source npm --yes",
    docsUrl: "/docs/tutorials/oidc/starter-with-npx",
    label: "Next.js template",
    promptUrl: "/agent-prompts/qf-next-starter.md",
    title: "Start with the official Quran Foundation app scaffold",
    promptText: `Set up a production-style Quran Foundation Next.js app using the official scaffold.

Run this command:
npx @quranjs/create-app@latest my-quran-app --template next --package-manager npm --install --git --sdk-source npm --yes

Requirements:
- Use @quranjs/api/public in app, browser, or mobile-facing code.
- Use @quranjs/api/server on the backend for Content, Search, OAuth2 token exchange, refresh, and server-side User API calls.
- Keep CLIENT_SECRET server-side only.
- Use Authorization Code with PKCE and OpenID Connect for signed-in User APIs.
- Use Client Credentials for app-level Content and Search APIs.
- Keep Content/Search app tokens separate from signed-in user session tokens.
- Preserve the starter's server-side session boundary and secure cookie behavior.

Documentation to follow:
- Starter With NPX: https://api-docs.quran.foundation/docs/tutorials/oidc/starter-with-npx/
- JavaScript SDK: https://api-docs.quran.foundation/docs/sdk/javascript/
- User APIs Quickstart: https://api-docs.quran.foundation/docs/tutorials/oidc/user-apis-quickstart/
- OAuth2 Tutorial: https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2/
- Content APIs Quickstart: https://api-docs.quran.foundation/docs/quickstart/

Acceptance checks:
- The app runs locally after environment variables are set.
- Login, callback, refresh, logout, Content API reads, Search API reads, and signed-in User API calls are routed through the correct SDK entrypoints.
- No client secret, access token, refresh token, or session secret is exposed to browser JavaScript, logs, or generated client bundles.`,
  },
};

export default function AgentPromptCallout({
  className,
  promptId = "QF_NPX_STARTER_PROMPT_V1",
}: Props) {
  const prompt = PROMPTS[promptId];
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

  const handleCopy = React.useCallback(async () => {
    try {
      await copyToClipboard(prompt.promptText);
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
  }, [prompt.promptText]);

  return (
    <aside className={clsx(styles.callout, className)}>
      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Build with AI</p>
          <span className={styles.badge}>{prompt.label}</span>
        </div>
        <h2 className={styles.title}>{prompt.title}</h2>
        <p className={styles.description}>{prompt.description}</p>
        <code className={styles.command}>{prompt.command}</code>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
        >
          {copyState === "copied" ? "Copied" : "Copy prompt"}
        </button>
        <Link className={styles.secondaryLink} to={prompt.docsUrl}>
          View guide
        </Link>
        <a className={styles.secondaryLink} href={prompt.promptUrl}>
          Raw prompt
        </a>
        <span className={styles.status} aria-live="polite">
          {copyState === "failed" ? "Copy failed. Open the raw prompt." : ""}
        </span>
      </div>
    </aside>
  );
}
