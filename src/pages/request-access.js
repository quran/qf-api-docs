import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './request-access.module.css';

const DEVELOPER_CONSOLE_URL = 'https://dev-console.quran.foundation/projects';
const CREATE_APP_URL = 'https://dev-console.quran.foundation/projects/new';
const IMPORT_CLIENT_URL = 'https://dev-console.quran.foundation/claims';
const SUPPORT_EMAIL_URL = 'mailto:developers@quran.com';

const journeySteps = [
    {
        title: 'Create your app',
        description:
            'Add your app in Developer Console and get credentials for pre-live, our testing environment.',
        linkLabel: 'Open Developer Console',
        href: CREATE_APP_URL,
    },
    {
        title: 'Build and test',
        description:
            'Connect trusted Quran content and test the features your app needs.',
        linkLabel: 'Start with Content APIs',
        to: '/docs/quickstart/',
    },
    {
        title: 'Connect Quran ID',
        description:
            'Let users sign in and carry supported features between apps. Add notes, bookmarks, reflections, reading history, streaks, collections, and more through User APIs.',
        linkLabel: 'Integrate Quran ID',
        to: '/docs/tutorials/oidc/getting-started-with-oauth2/',
    },
    {
        title: 'Request production access',
        description:
            'Request the permissions your live app needs in Developer Console. Launch with production access once approved.',
        linkLabel: 'Open Developer Console',
        href: DEVELOPER_CONSOLE_URL,
    },
    {
        title: 'Submit to the Quran App Store',
        description:
            'Follow the Connected Apps guide, prepare your listing, and submit for review through Developer Console.',
        linkLabel: 'Read the Connected Apps guide',
        to: '/docs/connected-apps/',
    },
];

function StepLink({ step }) {
    if (step.to) {
        return (
            <Link className={styles.stepLink} to={step.to}>
                {step.linkLabel} <span aria-hidden="true">→</span>
            </Link>
        );
    }

    return (
        <a className={styles.stepLink} href={step.href}>
            {step.linkLabel} <span aria-hidden="true">↗</span>
        </a>
    );
}

export default function RequestAccess() {
    const quranIdLogo = useBaseUrl('/img/brand/quran-id.svg');
    const appStoreLogo = useBaseUrl('/img/brand/quran-app-store.svg');

    return (
        <Layout
            title="Start building"
            description="Create your app and get testing credentials in Developer Console. Manage your integration, request production access, and submit to the Quran App Store in one place."
        >
            <main className={styles.page}>
                <div className={`container ${styles.container}`}>
                    <section className={styles.hero} aria-labelledby="access-title">
                        <p className={styles.eyebrow}>Quran For Devs</p>
                        <h1 id="access-title" className={styles.title}>
                            Start building with Quran Foundation
                        </h1>
                        <p className={styles.lede}>
                            Create your app and get testing credentials in Developer
                            Console. Manage your integration, request production access,
                            and submit to the Quran App Store in one place.
                        </p>

                        <div className={styles.actions}>
                            <a
                                className="button button--primary button--lg"
                                href={CREATE_APP_URL}
                            >
                                Create your app
                                <span className={styles.externalIcon} aria-hidden="true">
                                    ↗
                                </span>
                            </a>
                            <p className={styles.existingAppPrompt}>
                                Already have an app?{' '}
                                <a href={DEVELOPER_CONSOLE_URL}>
                                    Open Developer Console <span aria-hidden="true">→</span>
                                </a>
                            </p>
                        </div>
                    </section>

                    <section className={styles.process} aria-labelledby="process-title">
                        <div className={styles.processIntro}>
                            <h2 id="process-title">
                                From your first integration to the Quran App Store
                            </h2>
                            <p>
                                Start with the APIs your app needs. Add Quran ID and
                                connected features to support a more complete Quran journey.
                            </p>
                        </div>

                        <ol className={styles.steps}>
                            {journeySteps.map((step, index) => (
                                <li className={styles.step} key={step.title}>
                                    <span className={styles.stepNumber} aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                    <StepLink step={step} />
                                </li>
                            ))}
                        </ol>

                        <p className={styles.contentOnlyNote}>
                            <strong>Building a content-only app?</strong> You can use Content
                            APIs without user sign-in. For a connected account experience,
                            add Quran ID and User APIs.
                        </p>
                    </section>

                    <section className={styles.deeper} aria-labelledby="deeper-title">
                        <div className={styles.deeperLogos}>
                            <img src={quranIdLogo} alt="Quran ID" width={40} height={40} />
                            <img
                                src={appStoreLogo}
                                alt="Quran App Store"
                                width={251}
                                height={200}
                            />
                        </div>
                        <div>
                            <h2 id="deeper-title">Aim for Transformational</h2>
                            <p>
                                Go beyond sign-in. Use Quran ID and connected features to help
                                people continue their Quran journey and make meaningful
                                progress across apps.
                            </p>
                            <Link to="/docs/connected-apps/">
                                Explore deeper integration <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </section>

                    <aside className={styles.transitionNote} aria-labelledby="existing-client-title">
                        <div>
                            <h2 id="existing-client-title">Already have API credentials?</h2>
                            <p>
                                Import your existing API client into Developer Console to
                                manage it alongside your other apps.
                            </p>
                            <p className={styles.pendingNote}>
                                <strong>Request still pending?</strong> No action is needed.
                                Existing requests will continue to be processed.
                            </p>
                        </div>
                        <a href={IMPORT_CLIENT_URL}>
                            Import an existing client <span aria-hidden="true">↗</span>
                        </a>
                    </aside>

                    <section className={styles.help} aria-labelledby="help-title">
                        <div>
                            <h2 id="help-title">Need help getting started?</h2>
                            <p>
                                Explore the docs or contact our developer team for help with
                                your integration.
                            </p>
                        </div>
                        <div className={styles.helpLinks}>
                            <Link to="/">
                                Explore the docs <span aria-hidden="true">→</span>
                            </Link>
                            <a href={SUPPORT_EMAIL_URL}>Contact the developer team</a>
                        </div>
                    </section>
                </div>
            </main>
        </Layout>
    );
}
