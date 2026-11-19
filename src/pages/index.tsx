import React from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import StarterCommandCard from "@site/src/components/StarterCommandCard";

import styles from "./index.module.css";

const PAGE_TITLE = "Quran Foundation Developer Docs";
const CREATE_APP_URL = "https://dev-console.quran.foundation/projects/new";
const DEVELOPER_CONSOLE_URL = "https://dev-console.quran.foundation/projects";
const QURAN_ID_OVERVIEW = "/docs/quran-id/";
const QURAN_ID_GUIDE = "/docs/tutorials/oidc/getting-started-with-oauth2/";
const SUPPORT_EMAIL_URL = "mailto:developers@quran.com";

type Capability = {
  title: string;
  logo?: string;
  heading: string;
  description: string;
  supporting: string;
  cta: string;
  href: string;
};

const capabilities: Capability[] = [
  {
    title: "Content APIs",
    heading: "Build with trusted Quran content",
    description:
      "Access Quran text, translations, tafsir, and recitations. Scholarly verified content, maintained through corrections and feedback, with respect for source rights.",
    supporting: "Users do not need to sign in to read content in your app.",
    cta: "Start with Content APIs",
    href: "/docs/quickstart/",
  },
  {
    title: "Quran ID",
    logo: "/img/brand/quran-id.svg",
    heading: "Connect one account across apps",
    description:
      "Let users sign in with Quran ID across Quran.com, Quran Apps, and connected apps. Pair it with User APIs so supported progress and features can follow them, with their permission.",
    supporting: "Built on OAuth2 and OpenID Connect.",
    cta: "Integrate Quran ID",
    href: QURAN_ID_OVERVIEW,
  },
  {
    title: "User APIs",
    heading: "Help users pick up where they left off",
    description:
      "Connect notes, bookmarks, reflections, reading history, streaks, collections, and more. Add the features that support your app’s purpose and your users’ Quran journey.",
    supporting:
      "Requires Quran ID and permission to access the relevant features.",
    cta: "Explore User APIs",
    href: "/docs/tutorials/oidc/user-apis-quickstart/",
  },
];

function HomepageHero() {
  React.useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>Quran For Devs</p>
        <h1 className={styles.heroTitle}>
          Build with trusted content. Keep users connected.
        </h1>
        <p className={styles.heroSubtitle}>
          Add Quran content and connected user features to your app with Quran
          Foundation APIs and Quran ID. Create and manage your app through
          Developer Console.
        </p>

        <div className={styles.heroActions}>
          <a className="button button--primary button--lg" href={CREATE_APP_URL}>
            Create your app
          </a>
          <Link
            className="button button--secondary button--lg"
            to="/docs/api-reference/"
          >
            Browse API reference
          </Link>
        </div>

        <p className={styles.returningLink}>
          Already building?{" "}
          <a href={DEVELOPER_CONSOLE_URL}>Open Developer Console</a>.
        </p>
      </div>
    </header>
  );
}

function CapabilityCards() {
  const quranIdLogo = useBaseUrl("/img/brand/quran-id.svg");

  return (
    <section className={styles.section} aria-labelledby="capabilities-title">
      <div className={styles.inner}>
        <h2 id="capabilities-title" className={styles.sectionTitle}>
          What will you add to your app?
        </h2>
        <ul className={styles.cardGrid}>
          {capabilities.map((item) => (
            <li className={styles.card} key={item.title}>
              <p className={styles.cardLabel}>
                {item.logo ? (
                  <img
                    className={styles.cardLogo}
                    src={quranIdLogo}
                    alt=""
                    width={28}
                    height={28}
                  />
                ) : null}
                {item.title}
              </p>
              <h3 className={styles.cardTitle}>{item.heading}</h3>
              <p className={styles.cardText}>{item.description}</p>
              <p className={styles.cardSupporting}>{item.supporting}</p>
              <Link className={styles.cardLink} to={item.href}>
                {item.cta} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ImplementationChoices() {
  return (
    <section
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="build-title"
    >
      <div className={styles.inner}>
        <h2 id="build-title" className={styles.sectionTitle}>
          Choose how to build
        </h2>
        <p className={styles.sectionIntro}>
          Create your app in Developer Console, then start with a template, use
          an SDK, or call the APIs directly.
        </p>

        <StarterCommandCard className={styles.starterCard} headingLevel="h3" />

        <ul className={`${styles.cardGrid} ${styles.cardGridTwo}`}>
          <li className={styles.card}>
            <p className={styles.cardLabel}>JavaScript / TypeScript SDK</p>
            <h3 className={styles.cardTitle}>Add APIs to your existing app</h3>
            <p className={styles.cardText}>
              Use the JavaScript / TypeScript SDK for Content APIs, Quran ID
              integration, and User APIs. Follow the setup for your app type.
            </p>
            <Link className={styles.cardLink} to="/docs/sdk/javascript/">
              Use the SDK <span aria-hidden="true">→</span>
            </Link>
          </li>
          <li className={styles.card}>
            <p className={styles.cardLabel}>Direct API integration</p>
            <h3 className={styles.cardTitle}>
              Build with your preferred stack
            </h3>
            <p className={styles.cardText}>
              Use the API reference and integration guides to connect your app
              directly. Follow the Quran ID guide when you need user sign-in.
            </p>
            <Link className={styles.cardLink} to="/docs/api-reference/">
              Browse API reference <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.cardTextLink} to={QURAN_ID_GUIDE}>
              Quran ID: OAuth2/OIDC guide
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

function AiResources() {
  return (
    <section className={styles.section} aria-labelledby="ai-title">
      <div className={styles.inner}>
        <h2 id="ai-title" className={styles.sectionTitle}>
          Building with an AI assistant?
        </h2>
        <nav className={styles.resourceRow} aria-label="AI developer resources">
          <a href="/agent-prompts/qf-next-starter.md">AI starter prompt</a>
          <a href="/llms.txt">LLMs.txt</a>
        </nav>
      </div>
    </section>
  );
}

function AppStoreSection() {
  return (
    <section className={styles.section} aria-labelledby="app-store-title">
      <div className={`${styles.inner} ${styles.appStore}`}>
        <h2 id="app-store-title" className={styles.sectionTitle}>
          Build toward a connected Quran experience
        </h2>
        <p className={styles.sectionIntro}>
          Aim for Transformational status by combining Quran ID with features
          that support meaningful progress. Follow the Connected Apps guide
          and submit your app for Quran App Store review through Developer
          Console.
        </p>
        <div className={styles.sectionActions}>
          <Link
            className="button button--primary"
            to="/docs/connected-apps/"
          >
            Read the Connected Apps guide
          </Link>
          <a
            className="button button--secondary"
            href="https://quran.com/apps"
          >
            Explore the Quran App Store
          </a>
        </div>
      </div>
    </section>
  );
}

function HelpSection() {
  return (
    <section
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="help-title"
    >
      <div className={`${styles.inner} ${styles.help}`}>
        <h2 id="help-title" className={styles.helpTitle}>
          Need help with your integration?
        </h2>
        <p className={styles.helpText}>
          Manage credentials and permissions in Developer Console. For
          integration or review questions, contact our developer team.
        </p>
        <div className={styles.helpLinks}>
          <a className="button button--primary" href={DEVELOPER_CONSOLE_URL}>
            Open Developer Console <span aria-hidden="true">↗</span>
          </a>
          <a className="button button--secondary" href={SUPPORT_EMAIL_URL}>
            Contact the developer team
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout description="Build with trusted Quran content and keep users connected with Quran ID. Quran Foundation developer docs for Content APIs, User APIs, SDKs, and Developer Console.">
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta property="og:title" content={PAGE_TITLE} />
      </Head>
      <HomepageHero />
      <main>
        <CapabilityCards />
        <ImplementationChoices />
        <AiResources />
        <AppStoreSection />
        <HelpSection />
      </main>
    </Layout>
  );
}
