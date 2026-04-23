import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

type ApiCard = {
  title: string;
  icon: string;
  description: string;
  link: string;
};

const ApiCards: ApiCard[] = [
  {
    title: "Content APIs",
    icon: "📖",
    description:
      "Access Quranic chapters, verses, translations, audio files, and search through comprehensive endpoints designed for seamless app integration.",
    link: "/docs/content_apis_versioned/content-apis",
  },
  {
    title: "OAuth2 / OIDC APIs",
    icon: "🔐",
    description:
      "Implement secure user authentication using industry-standard OAuth2 and OpenID Connect flows. Manage tokens, authorization, and identity.",
    link: "/docs/oauth2_apis_versioned/oauth-2-apis",
  },
  {
    title: "User-related APIs",
    icon: "👤",
    description:
      "Manage user data including bookmarks, reading sessions, preferences, goals, notes, and collections. Build personalized Quran experiences.",
    link: "/docs/user_related_apis_versioned/user-related-apis",
  },
];

function ApiCardItem({ title, icon, description, link }: ApiCard) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <p className={styles.cardDescription}>{description}</p>
      <Link className={styles.cardLink} to={link}>
        See docs →
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Get started with our APIs:</h2>
          <Link
            className={styles.sectionLink}
            to="/docs/content_apis_versioned/content-apis"
          >
            See API References
          </Link>
        </div>
        <div className={styles.cardGrid}>
          {ApiCards.map((card) => (
            <ApiCardItem key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
