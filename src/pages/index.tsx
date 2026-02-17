import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
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

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Quran Foundation Documentation Portal
        </h1>
        <p className={styles.heroSubtitle}>
          Our API documentation is clear, concise, easy to understand and will
          help you create innovative and engaging Quran-related apps.
        </p>

        <div className={styles.heroButtonRow}>
          <Link
            className={clsx("button button--lg", styles.primaryButton)}
            to="/docs/quickstart"
          >
            🚀 Quick Start Guide
          </Link>
          <button
            type="button"
            className={clsx("button button--lg", styles.outlineButton)}
            onClick={() => setActiveModal("benefits")}
          >
            Explore Dev Benefits
          </button>
          <button
            type="button"
            className={clsx("button button--lg", styles.outlineButton)}
            onClick={() => setActiveModal("disclaimers")}
          >
            Read Dev Disclaimers
          </button>
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
