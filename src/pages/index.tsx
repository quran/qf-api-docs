import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link"; // ✅ Import Link for the button
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [activeModal, setActiveModal] = React.useState<
    "benefits" | "disclaimers" | null
  >(null);

  const benefitPoints = [
    "Comprehensive APIs, backend, and managed data so you can focus on solving unique problems.",
    "Opportunity to be featured on Quran.com via Quran App Portal.",
    "Direct support from Quran Foundation and its broader network.",
    "Reliable, copyrighted, scholarly verified content.",
    "Mission-driven community that prioritizes da'wah impact.",
    "Users can bring their reading history, bookmarks, saved verses, notes, reflections, and streaks into your app.",
    "Full feature set from Quran.com and QuranReflect, plus OAuth and a notification engine.",
    "Funding or in-kind support for high-value projects aligned with Quran Foundation plans.",
  ];

  const disclaimerPoints = [
    "Building a Quranic or guidance app puts you in a da'wah role, clarify your references and scholars, and consult them on content, behavior design, priorities, and potential harms.",
    "Respect copyrights and licensing expectations.",
    "Honor scholarly review and keep content aligned with verified sources.",
    "Use the API to keep content accurate as removals, additions, or edits occur.",
    "Examine intention and risks, your product shapes hearts and behavior.",
    "Focus on solving unique problems; the ummah needs more coverage than current resources provide.",
    "Decide your commercial stance with scholars; if allowed, follow guidelines for both developers and Quran Foundation collaboration.",
    "Practice ta'awun (Quranic collaboration) with the wider ecosystem.",
    "Align with our vision and architecture (auth, user features, notifications) to receive support.",
  ];

  const closeModal = React.useCallback(() => setActiveModal(null), []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  React.useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

  const renderModal = (
    title: string,
    points: string[],
    ctaLabel: string
  ) => {
    if (activeModal === null) return null;
    return (
      <div
        className={styles.modalOverlay}
        role="dialog"
        aria-modal="true"
        onClick={closeModal}
      >
        <div
          className={styles.modalCard}
          onClick={(event: React.MouseEvent<HTMLDivElement>) =>
            event.stopPropagation()
          }
        >
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>{title}</h3>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
          <ul className={styles.modalList}>
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <button
            type="button"
            className={clsx("button button--primary button--md", styles.modalCta)}
            onClick={closeModal}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>

        <div className={styles.heroButtonRow}>
          <button
            type="button"
            className={clsx("button button--lg", styles.outlineButton)}
            onClick={() => setActiveModal("benefits")}
          >
            💎 Dev Benefits
          </button>
          <button
            type="button"
            className={clsx("button button--lg", styles.ghostButton)}
            onClick={() => setActiveModal("disclaimers")}
          >
            ⚠️ Dev Disclaimers
          </button>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quickstart"
          >
            🚀 Quick Start Guide
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/docs/category/content-apis"
          >
            📂 API Reference
          </Link>
        </div>
        <div className={styles.mobileRequestAccess}>
          <Link
            className="button button--secondary button--lg"
            to="/request-access"
          >
            📨 Request Access
          </Link>
        </div>
      </div>
      {activeModal === "benefits" &&
        renderModal("Developer Benefits", benefitPoints, "Got it")}
      {activeModal === "disclaimers" &&
        renderModal("Developer Disclaimers", disclaimerPoints, "Understood")}
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="QuranFoundation API Docs portal that will help Muslim developers get the Ummah closer to the Quran by seamlessly develop apps on top of Quran.Foundation's APIs."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
