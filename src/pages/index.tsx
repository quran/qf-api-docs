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
      description="Quran Foundation's Docs portal that will help Muslim developers get the Ummah closer to the Quran by seamlessly develop apps on top of Quran.Foundation's APIs."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
