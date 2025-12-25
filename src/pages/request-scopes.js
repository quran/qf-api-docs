import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './request-scopes.module.css';

const getTargetLabel = (targets) => {
    if (!targets.length) {
        return 'your credentials';
    }
    const hasLive = targets.includes('live');
    const hasPrelive = targets.includes('prelive');
    if (hasLive && hasPrelive) {
        return 'your pre-production and production credentials';
    }
    if (hasLive) {
        return 'your production credentials';
    }
    if (hasPrelive) {
        return 'your pre-production credentials';
    }
    return 'your credentials';
};

export default function RequestScopes() {
    const { siteConfig } = useDocusaurusContext();
    const apiBaseUrl =
        siteConfig.customFields?.scopeRequestApiBaseUrl ||
        'https://qf-form-handler.fly.dev';

    const [status, setStatus] = useState('loading');
    const [email, setEmail] = useState('');
    const [appName, setAppName] = useState('');
    const [scopes, setScopes] = useState([]);
    const [targets, setTargets] = useState([]);
    const [token, setToken] = useState('');
    const [selectedScopes, setSelectedScopes] = useState(new Set());
    const [lockedScopes, setLockedScopes] = useState(new Set());
    const [readOnlyTargets, setReadOnlyTargets] = useState([]);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (!urlToken) {
            setStatus('invalid');
            return;
        }

        setToken(urlToken);
        setStatus('loading');

        const loadMetadata = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/v1/scope-requests/metadata`,
                    {
                        headers: {
                            Authorization: `Bearer ${urlToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    setStatus('invalid');
                    return;
                }

                const data = await response.json();
                setEmail(data.email || '');
                setAppName(data.appName || '');
                setScopes(Array.isArray(data.scopes) ? data.scopes : []);
                setTargets(Array.isArray(data.targets) ? data.targets : []);
                setReadOnlyTargets(
                    Array.isArray(data.readOnlyTargets) ? data.readOnlyTargets : []
                );
                const preselected = Array.isArray(data.preselectedScopes)
                    ? data.preselectedScopes
                    : [];
                const lockedSet = new Set(preselected);
                setLockedScopes(lockedSet);
                setSelectedScopes(new Set(preselected));
                setStatus('ready');
            } catch (error) {
                setStatus('invalid');
            }
        };

        loadMetadata();
    }, [apiBaseUrl]);

    const groupedScopes = useMemo(() => {
        const groups = [];
        const groupMap = new Map();

        scopes.forEach((scope) => {
            const group = scope.group || 'Other';
            if (!groupMap.has(group)) {
                const entry = { title: group, scopes: [] };
                groupMap.set(group, entry);
                groups.push(entry);
            }
            groupMap.get(group).scopes.push(scope);
        });

        return groups;
    }, [scopes]);

    const handleScopeToggle = (value) => {
        if (lockedScopes.has(value)) {
            return;
        }
        setSelectedScopes((prev) => {
            const next = new Set(prev);
            if (next.has(value)) {
                next.delete(value);
            } else {
                next.add(value);
            }
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitStatus(null);
        setErrorMessage('');

        if (!selectedScopes.size) {
            setErrorMessage('Please select at least one scope.');
            return;
        }

        try {
            setSubmitStatus('submitting');
            const response = await fetch(
                `${apiBaseUrl}/api/v1/scope-requests`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        scopes: Array.from(selectedScopes),
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    setStatus('invalid');
                    return;
                }
                const payload = await response.json().catch(() => ({}));
                setErrorMessage(
                    payload.error || 'Unable to submit your request right now.'
                );
                setSubmitStatus('error');
                return;
            }

            setSubmitStatus('success');
        } catch (error) {
            setErrorMessage('Unable to submit your request right now.');
            setSubmitStatus('error');
        }
    };

    const targetLabel = getTargetLabel(targets);
    const hasPreliveReadOnly = readOnlyTargets.includes('prelive');
    const selectedCount = selectedScopes.size;

    return (
        <Layout
            title="Request Additional Scopes"
            description="Request additional OAuth scopes for your API credentials"
        >
            <Head>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <div className="container margin-vert--md">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <h1>Request Additional Scopes</h1>
                        <p className="padding-bottom--md">
                            Select the scopes you need. We will apply the approved
                            scopes immediately to {targetLabel}.
                        </p>

                        {status === 'loading' && (
                            <div className="alert alert--info">Loading...</div>
                        )}

                        {status === 'invalid' && (
                            <div className="alert alert--danger">
                                This link is expired or invalid. Please request a
                                new link from your credential email or contact{' '}
                                <a href="mailto:developers@quran.com">
                                    developers@quran.com
                                </a>
                                .
                            </div>
                        )}

                        {status === 'ready' && (
                            <form onSubmit={handleSubmit} className={styles.scopeForm}>
                                {hasPreliveReadOnly && (
                                    <div className="alert alert--info">
                                        Pre-production already includes all scopes. Your
                                        selections below apply to production only.
                                    </div>
                                )}
                                <div className="margin-bottom--md">
                                    <label htmlFor="email" className="form-label">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={clsx('form-input', styles.readonlyInput)}
                                        value={email}
                                        readOnly
                                    />
                                </div>
                                <div className="margin-bottom--md">
                                    <label htmlFor="appName" className="form-label">
                                        App name
                                    </label>
                                    <input
                                        id="appName"
                                        type="text"
                                        className={clsx('form-input', styles.readonlyInput)}
                                        value={appName}
                                        placeholder="Not provided"
                                        readOnly
                                    />
                                </div>

                                <div className={styles.summaryRow}>
                                    <span className={styles.summaryLabel}>
                                        Selected scopes:
                                    </span>
                                    <span className={styles.summaryValue}>
                                        {selectedCount}
                                    </span>
                                </div>

                                <div className={styles.scopesContainer}>
                                    {groupedScopes.map((group) => (
                                        <div key={group.title} className={styles.scopeGroup}>
                                            <h3 className={styles.scopeGroupTitle}>{group.title}</h3>
                                            <div className={styles.scopeList}>
                                                {group.scopes.map((scope) => {
                                                    const isLocked = lockedScopes.has(scope.value);
                                                    return (
                                                        <label
                                                            key={scope.value}
                                                            className={clsx(
                                                                styles.scopeItem,
                                                                scope.isParent && styles.scopeParent,
                                                                isLocked && styles.scopeLocked
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedScopes.has(scope.value)}
                                                                disabled={isLocked}
                                                                onChange={() =>
                                                                    handleScopeToggle(scope.value)
                                                                }
                                                            />
                                                            <span className={styles.scopeContent}>
                                                                <span className={styles.scopeLabel}>
                                                                    {scope.label || scope.value}
                                                                </span>
                                                                {isLocked && (
                                                                    <span className={styles.lockedBadge}>
                                                                        Included by default
                                                                    </span>
                                                                )}
                                                                <span className={styles.scopeDescription}>
                                                                    {scope.developerDescription || scope.description}
                                                                </span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errorMessage && (
                                    <div className="alert alert--danger margin-top--md">
                                        {errorMessage}
                                    </div>
                                )}

                                {submitStatus === 'success' && (
                                    <div className="alert alert--success margin-top--md">
                                        Request submitted and applied. You can now
                                        request tokens with your updated scopes.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="button button--primary button--block margin-top--md"
                                    disabled={submitStatus === 'submitting'}
                                >
                                    {submitStatus === 'submitting'
                                        ? 'Submitting...'
                                        : 'Submit Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
