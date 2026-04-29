import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import styles from "./styles.module.css";

type Props = {
  variant?: "homepage" | "docs";
};

const pathItems = [
  {
    question: "Need Quran data without login?",
    title: "Content APIs",
    body: "Read verses, chapters, translations, tafsir, audio, and search with app credentials. No Quran.com user account or OAuth user session is involved.",
    outcome: "Call from your backend with the SDK or raw HTTP.",
    code: "GET /content/api/v4/chapters",
    href: "/docs/quickstart",
    cta: "Start Content Quickstart",
  },
  {
    question: "Prefer typed clients over raw HTTP?",
    title: "JavaScript SDK",
    body: "Use the SDK when you are building in JavaScript or TypeScript and want typed clients for Content, Search, OAuth helpers, and User APIs.",
    outcome: "Use the server entrypoint for backend/API calls and the public entrypoint only for browser or mobile-safe OAuth helpers.",
    code: 'import { createServerClient } from "@quranjs/api/server";',
    href: "/docs/sdk/javascript",
    cta: "Open JavaScript SDK",
  },
  {
    question: "Need signed-in user data?",
    title: "User APIs",
    body: "Add Quran.com user features to an existing app: bookmarks, collections, notes, reading progress, goals, and preferences.",
    outcome: "Requires OAuth login/session; call from your backend with the SDK or raw HTTP.",
    code: "GET /auth/v1/bookmarks",
    href: "/docs/tutorials/oidc/user-apis-quickstart",
    cta: "Open User APIs Quickstart",
  },
  {
    question: "Need to implement auth yourself?",
    title: "Manual OAuth2",
    body: "Use this for custom token handling, non-JS stacks, mobile apps, or debugging OAuth2/OIDC behavior.",
    outcome: "Protocol guide for PKCE, token exchange, refresh, scopes, and OIDC validation.",
    code: "POST /oauth2/token",
    href: "/docs/tutorials/oidc/getting-started-with-oauth2",
    cta: "Open OAuth2 Tutorial",
  },
];

export default function DeveloperJourneyMap({ variant = "docs" }: Props) {
  return (
    <section
      className={clsx(styles.section, {
        [styles.homepage]: variant === "homepage",
      })}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Pick your path</p>
          <h2 className={styles.title}>Start with the route that matches your app</h2>
          <p className={styles.description}>
            Request access first. Then choose by what you need: content without
            login, SDK clients in your own app, signed-in user data, or manual
            OAuth2 implementation.
          </p>
        </div>

        <div className={styles.prerequisite}>
          <div>
            <p className={styles.prerequisiteLabel}>Required first</p>
            <h3 className={styles.prerequisiteTitle}>Request access</h3>
            <p className={styles.prerequisiteText}>
              Get a client ID, confirm redirect URIs, and request the scopes
              your app needs before implementation work starts.
            </p>
          </div>
          <Link className={styles.prerequisiteLink} to="/request-access">
            Request Access
          </Link>
        </div>

        <ul className={styles.grid}>
          {pathItems.map((item) => (
            <li className={styles.card} key={item.href}>
              <div className={styles.cardHeader}>
                <p className={styles.question}>{item.question}</p>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.body}</p>
              <p className={styles.outcome}>{item.outcome}</p>
              <code className={styles.code}>{item.code}</code>
              <Link className={styles.cardLink} to={item.href}>
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.referenceRow}>
          <span>Already know the API family?</span>
          <Link to="/docs/api-reference">Browse API Reference</Link>
        </div>
      </div>
    </section>
  );
}
