import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useForm } from 'react-hook-form';
import styles from './request-access.module.css';
import {
    DeveloperBenefitsModal,
    DeveloperDisclaimersModal,
} from '@site/src/components/DeveloperModals';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const REQUEST_ACCESS_FORM_STORAGE_KEY = 'qf:request-access-form:v1';

const DEFAULT_FORM_VALUES = {
    appName: '',
    email: '',
    callbackUrl: '',
    logoUri: '',
    clientUri: '',
    policyUri: '',
    tosUri: '',
    postLogoutRedirectUris: '',
    agreementsAccepted: false,
};

const normalizeOptionalValue = (value) => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
};

function sanitizeFormValues(values) {
    if (!values || typeof values !== 'object') {
        return { ...DEFAULT_FORM_VALUES };
    }

    return {
        ...DEFAULT_FORM_VALUES,
        appName: typeof values.appName === 'string' ? values.appName : '',
        email: typeof values.email === 'string' ? values.email : '',
        callbackUrl: typeof values.callbackUrl === 'string' ? values.callbackUrl : '',
        logoUri: typeof values.logoUri === 'string' ? values.logoUri : '',
        clientUri: typeof values.clientUri === 'string' ? values.clientUri : '',
        policyUri: typeof values.policyUri === 'string' ? values.policyUri : '',
        tosUri: typeof values.tosUri === 'string' ? values.tosUri : '',
        postLogoutRedirectUris:
            typeof values.postLogoutRedirectUris === 'string'
                ? values.postLogoutRedirectUris
                : '',
        agreementsAccepted: Boolean(values.agreementsAccepted),
    };
}

function isEmptyFormValues(values) {
    return (
        !values.appName &&
        !values.email &&
        !values.callbackUrl &&
        !values.logoUri &&
        !values.clientUri &&
        !values.policyUri &&
        !values.tosUri &&
        !values.postLogoutRedirectUris &&
        !values.agreementsAccepted
    );
}

export default function RequestAccess() {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: DEFAULT_FORM_VALUES,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [activeModal, setActiveModal] = useState(null); // "benefits" | "disclaimers"
    const hasAcceptedTerms = watch('agreementsAccepted', false);

    const { siteConfig } = useDocusaurusContext();
    const apiBaseUrl =
        siteConfig.customFields?.scopeRequestApiBaseUrl ||
        'https://qf-form-handler.fly.dev';
    

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedValues = window.sessionStorage.getItem(REQUEST_ACCESS_FORM_STORAGE_KEY);
        if (!storedValues) {
            return;
        }
        try {
            reset(sanitizeFormValues(JSON.parse(storedValues)));
        } catch (error) {
            window.sessionStorage.removeItem(REQUEST_ACCESS_FORM_STORAGE_KEY);
        }
    }, [reset]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const subscription = watch((value) => {
            try {
                const sanitizedValues = sanitizeFormValues(value);
                if (isEmptyFormValues(sanitizedValues)) {
                    window.sessionStorage.removeItem(REQUEST_ACCESS_FORM_STORAGE_KEY);
                } else {
                    window.sessionStorage.setItem(
                        REQUEST_ACCESS_FORM_STORAGE_KEY,
                        JSON.stringify(sanitizedValues)
                    );
                }
            } catch (error) {
                // Ignore storage errors (e.g., quota or serialization issues).
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const closeModal = useCallback(() => setActiveModal(null), []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError('');
        const redirectUri = normalizeOptionalValue(data.callbackUrl);
        const postLogoutRedirectUri = normalizeOptionalValue(data.postLogoutRedirectUris);
        const payload = {
            appName: data.appName,
            email: data.email,
            callbackUrl: redirectUri,
            agreementsAccepted: data.agreementsAccepted,
            logo_uri: normalizeOptionalValue(data.logoUri),
            client_uri: normalizeOptionalValue(data.clientUri),
            policy_uri: normalizeOptionalValue(data.policyUri),
            tos_uri: normalizeOptionalValue(data.tosUri),
            redirect_uris: redirectUri,
            post_logout_redirect_uris: postLogoutRedirectUri,
        };
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                setSubmitStatus('error');
                setSubmitError(
                    payload.error || 'There was an error submitting your request. Please try again later.'
                );
                setIsSubmitting(false);
                return;
            }

            setSubmitStatus('success');
            reset();
            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem(REQUEST_ACCESS_FORM_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            setSubmitError('There was an error submitting your request. Please try again later.');
        }
        setIsSubmitting(false);
    };

    return (
        <Layout title="Request Access" description="Request access to Quran Foundation APIs">
            <div className="container margin-vert--md">
                <div className="row">
                    <div className="col col--6 col--offset-3">
                        <h1>Request API Access</h1>
                        <p className="padding-bottom--md">
                            Fill out this form to request access to the Quran Foundation APIs. We'll review your request and get back to you soon.
                        </p>

                        <div className={styles.infoRow}>
                            <button
                                type="button"
                                className={clsx('button button--lg', styles.outlineButton)}
                                onClick={() => setActiveModal('benefits')}
                            >
                                💎 Dev Benefits
                            </button>
                            <button
                                type="button"
                                className={clsx('button button--lg', styles.ghostButton)}
                                onClick={() => setActiveModal('disclaimers')}
                            >
                                ⚠️ Dev Disclaimers
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="request-access-form">
                            <div className="margin-bottom--md">
                                <label htmlFor="appName" className="form-label">
                                    App Name *
                                </label>
                                <input
                                    type="text"
                                    id="appName"
                                    className={`form-input ${errors.appName ? 'form-input-error' : ''}`}
                                    {...register('appName', { required: 'App name is required' })}
                                />
                                {errors.appName && (
                                    <div className="error-message">{errors.appName.message}</div>
                                )}
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="email" className="form-label">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <div className="error-message">{errors.email.message}</div>
                                )}
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="callbackUrl" className="form-label">
                                    Redirect URI
                                </label>
                                <input
                                    type="url"
                                    id="callbackUrl"
                                    className="form-input"
                                    placeholder="https://your-app.com/callback"
                                    {...register('callbackUrl')}
                                />
                                <small className="text-muted">
                                    Optional: Provide the OAuth callback URL.
                                </small>
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="logoUri" className="form-label">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    id="logoUri"
                                    className="form-input"
                                    placeholder="https://your-app.com/logo.png"
                                    {...register('logoUri')}
                                />
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="clientUri" className="form-label">
                                    Client URL
                                </label>
                                <input
                                    type="url"
                                    id="clientUri"
                                    className="form-input"
                                    placeholder="https://your-app.com"
                                    {...register('clientUri')}
                                />
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="policyUri" className="form-label">
                                    Privacy Policy URL
                                </label>
                                <input
                                    type="url"
                                    id="policyUri"
                                    className="form-input"
                                    placeholder="https://your-app.com/privacy"
                                    {...register('policyUri')}
                                />
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="tosUri" className="form-label">
                                    Terms of Service URL
                                </label>
                                <input
                                    type="url"
                                    id="tosUri"
                                    className="form-input"
                                    placeholder="https://your-app.com/terms"
                                    {...register('tosUri')}
                                />
                            </div>

                            <div className="margin-bottom--md">
                                <label htmlFor="postLogoutRedirectUris" className="form-label">
                                    Post-logout Redirect URI
                                </label>
                                <input
                                    type="url"
                                    id="postLogoutRedirectUris"
                                    className="form-input"
                                    placeholder="https://your-app.com/"
                                    {...register('postLogoutRedirectUris')}
                                />
                                <small className="text-muted">
                                    Optional: Provide the post-logout redirect URL.
                                </small>
                            </div>

                            <div className="margin-bottom--md">
                                <div>
                                    <input
                                        type="checkbox"
                                        id="agreementsAccepted"
                                        {...register('agreementsAccepted', {
                                            required: 'You must agree to the terms to continue',
                                        })}
                                    />
                                    <label htmlFor="agreementsAccepted" className="form-label" style={{ display: 'inline', marginLeft: '0.5rem' }}>
                                        I have read and agree to the{' '}
                                        <Link target='_blank' to="/legal/developer-terms" rel='noopener noreferrer'>
                                            Quran Foundation Developer Terms of Service
                                        </Link>{' '}
                                        and the{' '}
                                        <Link target='_blank' to="/legal/developer-privacy" rel='noopener noreferrer'>
                                            Developer Privacy Policy Requirements
                                        </Link>
                                        .
                                    </label>
                                </div>
                                {errors.agreementsAccepted && (
                                    <div className="error-message">
                                        {errors.agreementsAccepted.message}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="button button--primary button--block"
                                disabled={isSubmitting || !hasAcceptedTerms}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>

                            {submitStatus === 'success' && (
                                <div className="alert alert--success margin-top--md">
                                    Your request has been submitted successfully! We'll review it and get back to you soon.
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="alert alert--danger margin-top--md">
                                    {submitError || 'There was an error submitting your request. Please try again later.'}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <DeveloperBenefitsModal
                isOpen={activeModal === 'benefits'}
                onClose={closeModal}
            />
            <DeveloperDisclaimersModal
                isOpen={activeModal === 'disclaimers'}
                onClose={closeModal}
            />
        </Layout>
    );
}
