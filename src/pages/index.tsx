import React from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import StarterCommandCard from "@site/src/components/StarterCommandCard";

import styles from "./index.module.css";

const PAGE_TITLE = "Quran Foundation Developer Docs";
const CREATE_APP_URL = "https://dev-console.quran.foundation/projects/new";
const DEVELOPER_CONSOLE_URL = "https://dev-console.quran.foundation/projects";
const QURAN_ID_OVERVIEW = "/docs/quran-id/";
const QURAN_ID_GUIDE = "/docs/tutorials/oidc/getting-started-with-oauth2/";
const SUPPORT_EMAIL_URL = "mailto:developers@quran.com";
const QURAN_AI_URL = "https://quran.ai/";
const QURAN_MCP_URL = "https://mcp.quran.ai/";
const USAGE_REQUIREMENTS_URL =
  "/docs/connected-apps/#content-and-attribution-requirements";

// Brand lockups are served from the Brand Assets library, one file per theme.
const BRAND_LOCKUPS_URL = "https://brand.quran.foundation/Logos%20For%20Dev/lockups";

type LockupProps = {
  slug: string;
  name: string;
  size?: "hero" | "card";
};

function Lockup({ slug, name, size = "card" }: LockupProps) {
  const sizeClass = size === "hero" ? styles.lockupHero : styles.lockupCard;

  return (
    <>
      <img
        className={`${styles.lockup} ${sizeClass} ${styles.lockupLight}`}
        src={`${BRAND_LOCKUPS_URL}/${slug}-on-light.svg`}
        alt={name}
      />
      <img
        className={`${styles.lockup} ${sizeClass} ${styles.lockupDark}`}
        src={`${BRAND_LOCKUPS_URL}/${slug}-on-dark.svg`}
        alt={name}
      />
    </>
  );
}

type JourneyLink = {
  label: string;
  href: string;
};

type JourneyStage = {
  slug: string;
  name: string;
  heading: string;
  description: string;
  supporting: string;
  links: JourneyLink[];
};

const journeyStages: JourneyStage[] = [
  {
    slug: "quran-content-api",
    name: "Quran Content API",
    heading: "Trusted Quran content for your app",
    description:
      "Access Quran text, translations, tafsir, and recitations. Build on scholarly verified content, maintained through corrections and feedback, with respect for source rights.",
    supporting: "Users do not need to sign in to read content in your app.",
    links: [{ label: "Start with Content APIs", href: "/docs/quickstart/" }],
  },
  {
    slug: "quran-id",
    name: "Quran ID",
    heading: "One account. A connected Quran journey.",
    description:
      "Let users sign in with Quran ID and continue their journey across Quran.com, Quran Apps, and connected apps. Connect the features your app supports through User APIs, with their permission.",
    supporting:
      "Notes, bookmarks, reflections, reading history, streaks, collections, and more.",
    links: [
      { label: "Integrate Quran ID", href: QURAN_ID_OVERVIEW },
      {
        label: "Explore User APIs",
        href: "/docs/tutorials/oidc/user-apis-quickstart/",
      },
    ],
  },
  {
    slug: "quran-app-store",
    name: "Quran App Store",
    heading: "Help more people discover your app",
    description:
      "Join a growing ecosystem of apps serving different needs in the Quran journey. Follow the Connected Apps guide, then submit your app for review through Developer Console.",
    supporting: "Submit your app for review when your integration is ready.",
    links: [{ label: "Join the ecosystem", href: "/docs/connected-apps/" }],
  },
];

const weProvide = [
  "Scholarly verified Quran text, translations, tafsir and recitations, maintained through corrections and feedback",
  "Content APIs your users can read without signing in",
  "Quran ID and User APIs, so a reader’s journey continues across apps",
  "Discovery through the Quran App Store, and support through Developer Console",
];

const weAsk = [
  "Follow the content and usage requirements, including attribution and source rights",
  "Display Quran content unaltered",
  "Request only the permissions your app needs, and honour what users grant",
  "Share corrections and feedback so the content improves for everyone",
];

const transformationalPoints = [
  "Meaningful continuity for users, across apps and devices",
  "Deeper use of User APIs and personalized experiences",
  "Data sharing and shared insights, where appropriate",
  "Using those insights to understand the user journey and evolve the product toward greater benefit",
  "Greater visibility in the Quran App Store, and potential featuring on the Quran.com homepage",
  "At the highest level of integration, surfacing partner experiences at the ayah level on Quran.com, where appropriate",
];

function DashList({ className, items }: { className: string; items: string[] }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>
          <span aria-hidden="true">— </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

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
        <Lockup slug="quran-for-devs" name="Quran For Devs" size="hero" />
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

function JourneyStages() {
  return (
    <section className={styles.section} aria-labelledby="journey-title">
      <div className={styles.inner}>
        <h2 id="journey-title" className={styles.sectionTitle}>
          Build your connected Quran experience
        </h2>
        <p className={styles.sectionIntro}>
          Three stages, each building on the last — from trusted content, to a
          connected account, to discovery across the ecosystem.
        </p>
        <ul className={styles.cardGrid}>
          {journeyStages.map((stage) => (
            <li className={styles.card} key={stage.slug}>
              <Lockup slug={stage.slug} name={stage.name} />
              <h3 className={styles.cardTitle}>{stage.heading}</h3>
              <p className={styles.cardText}>{stage.description}</p>
              <p className={styles.cardSupporting}>{stage.supporting}</p>
              {stage.links.map((link) => (
                <Link className={styles.cardLink} to={link.href} key={link.href}>
                  {link.label} <span aria-hidden="true">→</span>
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function QuranAiPanel() {
  return (
    <section className={styles.section} aria-labelledby="quran-ai-title">
      <div className={`${styles.inner} ${styles.aiPanel}`}>
        <Lockup slug="quran-ai" name="Quran.ai" />
        <h2 id="quran-ai-title" className={styles.sectionTitle}>
          Connect AI tools to trusted Quran sources
        </h2>
        <p className={styles.sectionIntro}>
          Quran.ai brings Quran study into ChatGPT and Claude. Its Quran MCP
          feature gives AI tools access to Quran text, translations, tafsir,
          and linguistic resources.
        </p>
        <nav className={styles.aiLinks} aria-label="Quran.ai">
          <a href={QURAN_AI_URL}>
            Explore Quran.ai <span aria-hidden="true">→</span>
          </a>
          <a href={QURAN_MCP_URL}>
            Explore Quran MCP <span aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </section>
  );
}

function ExchangeSection() {
  return (
    <section className={styles.section} aria-labelledby="exchange-title">
      <div className={styles.inner}>
        <h2 id="exchange-title" className={styles.sectionTitle}>
          What we provide, and what we ask in return
        </h2>
        <p className={styles.sectionIntro}>
          Access to this content comes with responsibilities on both sides.
          Here is what we provide, and what we ask of the apps that build on
          it.
        </p>
        <div className={styles.exchangeColumns}>
          <div className={styles.card}>
            <h3 className={styles.exchangeHeading}>What we provide</h3>
            <DashList className={styles.exchangeList} items={weProvide} />
          </div>
          <div className={styles.card}>
            <h3 className={styles.exchangeHeading}>What we ask</h3>
            <DashList className={styles.exchangeList} items={weAsk} />
          </div>
        </div>
        <Link className={styles.cardLink} to={USAGE_REQUIREMENTS_URL}>
          Read the content and usage requirements{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

function ImplementationChoices() {
  return (
    <section className={styles.section} aria-labelledby="build-title">
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
            <h3 className={styles.exchangeHeading}>
              Add APIs to your existing app
            </h3>
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
            <h3 className={styles.exchangeHeading}>
              Build with your preferred stack
            </h3>
            <p className={styles.cardText}>
              Use the API reference and integration guides to connect your app
              directly. Follow the Quran ID guide when you need user sign-in.
            </p>
            <Link className={styles.cardLink} to="/docs/api-reference/">
              Browse API reference <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>

        <Link className={styles.cardTextLink} to={QURAN_ID_GUIDE}>
          Quran ID: OAuth2/OIDC guide
        </Link>
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
        <p className={styles.sectionIntro}>
          Model Context Protocol (MCP) lets an AI assistant call tools and read
          sources directly, instead of answering from training data alone.
          Point Claude, ChatGPT or Cursor at the Quran MCP server and it can
          look up Quran text, translations, tafsir and linguistic resources
          while it works.
        </p>
        <p className={styles.sectionIntro}>
          Use it when you are scaffolding an integration, exploring the API
          surface, or when you want an assistant whose answers cite real
          sources. The starter prompt and llms.txt give an assistant the
          context it needs before it writes code against these APIs.
        </p>
        <nav className={styles.resourceRow} aria-label="AI developer resources">
          <a href="/agent-prompts/qf-next-starter.md">AI starter prompt</a>
          <a href="/llms.txt">LLMs.txt</a>
          <a href={QURAN_MCP_URL}>
            Explore Quran MCP <span aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </section>
  );
}

function TransformationalSection() {
  return (
    <section className={styles.section} aria-labelledby="transformational-title">
      <div className={styles.inner}>
        <h2 id="transformational-title" className={styles.sectionTitle}>
          Aim for Transformational progress
        </h2>
        <p className={styles.sectionIntro}>
          Transformational is the deepest level of integration. It describes
          apps that do more than display content — they help users make
          meaningful progress, and they share what they learn so the whole
          ecosystem improves.
        </p>
        <DashList
          className={styles.unlocksList}
          items={transformationalPoints}
        />
        <div className={styles.sectionActions}>
          <Link className="button button--primary" to="/docs/connected-apps/">
            Read the Connected Apps guide
          </Link>
          <a className="button button--secondary" href="https://quran.com/apps">
            Explore the Quran App Store
          </a>
        </div>
      </div>
    </section>
  );
}

function HelpSection() {
  return (
    <section className={styles.section} aria-labelledby="help-title">
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
        <JourneyStages />
        <QuranAiPanel />
        <ExchangeSection />
        <ImplementationChoices />
        <AiResources />
        <TransformationalSection />
        <HelpSection />
      </main>
    </Layout>
  );
}
