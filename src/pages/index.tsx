import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link"; // ✅ Import Link for the button
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import {
  DeveloperBenefitsModal,
  DeveloperDisclaimersModal,
} from "@site/src/components/DeveloperModals";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [activeModal, setActiveModal] = React.useState<
    "benefits" | "disclaimers" | null
  >(null);

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
      <DeveloperBenefitsModal
        isOpen={activeModal === "benefits"}
        onClose={closeModal}
      />
      <DeveloperDisclaimersModal
        isOpen={activeModal === "disclaimers"}
        onClose={closeModal}
      />
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
