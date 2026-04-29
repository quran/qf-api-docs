import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import styles from "./styles.module.css";

type Props = {
  variant?: "homepage" | "docs";
};

const journeyItems = [
  {
    title: "Request access",
    body: "Get client credentials, confirm your redirect URIs, and make sure your app has the scopes it needs before implementation work starts.",
    href: "/request-access",
    cta: "Request Access",
  },
  {
    title: "Full app with login",
    body: "Start from the production-shaped Next.js scaffold with reader, search, notes, bookmarks, OAuth2, and SDK wiring already in place.",
    href: "/docs/tutorials/oidc/starter-with-npx",
    cta: "Use Starter With NPX",
  },
  {
    title: "Content-only backend",
    body: "Use Client Credentials from your backend to read Quran content, translations, tafsir, audio, and search data.",
    href: "/docs/quickstart",
    cta: "Open Content Quickstart",
  },
  {
    title: "Signed-in user features",
    body: "Add bookmarks, collections, notes, reading progress, goals, preferences, and Quran.com synced user data.",
    href: "/docs/tutorials/oidc/user-apis-quickstart",
    cta: "Open User Quickstart",
  },
  {
    title: "Custom OAuth or mobile",
    body: "Implement Authorization Code with PKCE and OpenID Connect manually for custom backend, React Native, Android, or iOS flows.",
    href: "/docs/tutorials/oidc/getting-started-with-oauth2",
    cta: "Open OAuth2 Tutorial",
  },
  {
    title: "Endpoint lookup",
    body: "Go directly to endpoint reference pages once you know the API family and authentication model you need.",
    href: "/docs/api-reference",
    cta: "Browse API Reference",
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
          <p className={styles.eyebrow}>Developer journey</p>
          <h2 className={styles.title}>Choose the shortest path to your integration</h2>
          <p className={styles.description}>
            Start by requesting access, then choose the path that matches what
            you are building. Use the API reference after the authentication
            shape is clear.
          </p>
        </div>

        <ol className={styles.grid}>
          {journeyItems.map((item, index) => (
            <li className={styles.card} key={item.href}>
              <div className={styles.step}>{index + 1}</div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.body}</p>
                <Link className={styles.cardLink} to={item.href}>
                  {item.cta}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
