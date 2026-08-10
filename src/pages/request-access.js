import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './request-access.module.css';

const DEVELOPER_CONSOLE_URL = 'https://dev-console.quran.foundation/projects';
const CREATE_APP_URL = 'https://dev-console.quran.foundation/projects/new';
const IMPORT_CLIENT_URL = 'https://dev-console.quran.foundation/claims';

const accessSteps = [
    {
        title: 'Create your app',
        description: 'Add your app details and redirect URLs in Developer Console.',
    },
    {
        title: 'Build in prelive',
        description: 'Use your credentials to integrate and test safely before launch.',
    },
    {
        title: 'Request production permissions',
        description: 'When you are ready, request the scopes your production app needs.',
    },
];

export default function RequestAccess() {
    return (
        <Layout
            title="Get API Access"
            description="Create and manage Quran.Foundation API apps in Developer Console"
        >
            <main className={styles.page}>
                <div className={`container ${styles.container}`}>
                    <section className={styles.hero} aria-labelledby="access-title">
                        <p className={styles.eyebrow}>Quran.Foundation Developer Platform</p>
                        <h1 id="access-title" className={styles.title}>
                            Get API access
                        </h1>
                        <p className={styles.lede}>
                            Create your app, manage credentials, and request production
                            permissions from one place in Developer Console.
                        </p>

                        <div className={styles.actions}>
                            <a
                                className="button button--primary button--lg"
                                href={CREATE_APP_URL}
                            >
                                Create an API app
                                <span className={styles.externalIcon} aria-hidden="true">
                                    ↗
                                </span>
                            </a>
                            <p className={styles.existingAppPrompt}>
                                Already have an app?{' '}
                                <a href={DEVELOPER_CONSOLE_URL}>
                                    Open your apps <span aria-hidden="true">→</span>
                                </a>
                            </p>
                        </div>
                    </section>

                    <section className={styles.process} aria-labelledby="process-title">
                        <div className={styles.processIntro}>
                            <h2 id="process-title">One path from idea to production</h2>
                            <p>
                                You can start building immediately, then ask for broader
                                access when your app is ready.
                            </p>
                        </div>

                        <ol className={styles.steps}>
                            {accessSteps.map((step, index) => (
                                <li className={styles.step} key={step.title}>
                                    <span className={styles.stepNumber} aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <aside className={styles.transitionNote} aria-labelledby="existing-client-title">
                        <div>
                            <h2 id="existing-client-title">Already have an existing client?</h2>
                            <p>
                                Import it into Developer Console to manage it alongside your
                                new apps.
                            </p>
                            <p className={styles.pendingNote}>
                                <strong>Request still pending?</strong> No action is needed.
                                Existing requests will continue to be processed.
                            </p>
                        </div>
                        <a href={IMPORT_CLIENT_URL}>Import existing client ↗</a>
                    </aside>

                    <p className={styles.footerLink}>
                        New to the platform?{' '}
                        <Link to="/docs/developer-journey">
                            Follow the developer journey
                        </Link>
                        .
                    </p>
                </div>
            </main>
        </Layout>
    );
}
