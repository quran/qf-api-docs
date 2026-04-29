import React from "react";
import Layout from "@theme/Layout";
import DeveloperJourneyMap from "@site/src/components/DeveloperJourneyMap";
import StarterCommandCard from "@site/src/components/StarterCommandCard";

import styles from "./index.module.css";

function HomepageHeader() {
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
          Quran.Foundation Documentation Portal
        </h1>
        <p className={styles.heroSubtitle}>
          Request access, pick the right integration path, and build with Quran
          Foundation APIs using the official docs, SDK, and starter app.
        </p>

        <StarterCommandCard />

        <nav
          className={styles.heroResourceLinks}
          aria-label="Secondary developer resources"
        >
          <a href="/docs/sdk/javascript">JavaScript SDK</a>
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
