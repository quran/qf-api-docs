import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import { NEXT_JS_STARTER_COMMAND } from "@site/src/lib/onboarding";

import styles from "./styles.module.css";

type Props = {
  variant?: "homepage" | "docs";
};

const pathItems = [
  {
    question: "Need Quran content only?",
    title: "Content APIs",
    time: "~10 min",
    body: "Use this for verses, chapters, translations, tafsir, audio, and search when users do not need to sign in.",
    outcome: "A backend call that reads Quran content with app credentials.",
    code: "GET /content/api/v4/chapters",
    href: "/docs/quickstart",
    cta: "Start Content Quickstart",
  },
  {
    question: "Need login and want to ship fast?",
    title: "Next.js starter",
    time: "~5 min",
    body: "Use the scaffold when you want OAuth2, reader, search, notes, bookmarks, and SDK runtime boundaries already wired.",
    outcome: "A local app with login, content reads, search, and user features.",
    code: NEXT_JS_STARTER_COMMAND,
    href: "/docs/tutorials/oidc/starter-with-npx",
    cta: "Use Starter With NPX",
  },
  {
    question: "Adding signed-in features to an app?",
    title: "User APIs",
    time: "~15 min",
    body: "Use this when your app already exists and needs bookmarks, collections, notes, reading progress, goals, or preferences.",
    outcome: "A backend-safe user session that can call User APIs.",
    code: "GET /auth/v1/bookmarks",
    href: "/docs/tutorials/oidc/user-apis-quickstart",
    cta: "Open User APIs Quickstart",
  },
  {
    question: "Building custom OAuth or mobile?",
    title: "Manual OAuth2",
    time: "~30 min",
    body: "Use this for custom backends, React Native, Android, iOS, or any case where you need the token flow details.",
    outcome: "Authorization Code with PKCE, token exchange, refresh, and OIDC validation.",
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
            Request access first, then choose one path. The API reference is for
            endpoint lookup after your authentication model is clear.
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
                <span className={styles.time}>{item.time}</span>
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
