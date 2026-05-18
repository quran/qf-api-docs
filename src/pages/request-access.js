import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useFieldArray, useForm } from 'react-hook-form';
import styles from './request-access.module.css';
import {
    DeveloperBenefitsModal,
    DeveloperDisclaimersModal,
} from '@site/src/components/DeveloperModals';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import requestAccessUtils from './request-access-utils.cjs';

const REQUEST_ACCESS_FORM_STORAGE_KEY = 'qf:request-access-form:v1';
const {
    createDefaultFormValues,
    createEmptyUriField,
    dedupeUriValues,
    isEmptyFormValues,
    normalizeOptionalValue,
    normalizeUriList,
    parsePastedUriValues,
    sanitizeFormValues,
    validateSingleUri,
    valuesFromUriField,
} = requestAccessUtils;

export default function RequestAccess() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        getValues,
        reset,
        setValue,
        watch,
    } = useForm({
        defaultValues: createDefaultFormValues(),
    });
    const {
        fields: redirectUriFields,
        append: appendRedirectUri,
        remove: removeRedirectUri,
        replace: replaceRedirectUris,
    } = useFieldArray({
        control,
        name: 'redirectUris',
    });
    const {
        fields: postLogoutRedirectUriFields,
        append: appendPostLogoutRedirectUri,
        remove: removePostLogoutRedirectUri,
        replace: replacePostLogoutRedirectUris,
    } = useFieldArray({
        control,
        name: 'postLogoutRedirectUris',
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

    const handleUriPaste = useCallback(
        (event, fieldName, index, replaceRows) => {
            const pastedText = event.clipboardData?.getData('text');
            const pastedValues = parsePastedUriValues(pastedText);
            if (!pastedValues.length) {
                return;
            }

            event.preventDefault();
            if (pastedValues.length === 1) {
                setValue(`${fieldName}.${index}.value`, pastedValues[0], {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                return;
            }

            const currentValues = getValues(fieldName);
            const existingValues = valuesFromUriField(currentValues);
            const nextValues = dedupeUriValues([
                ...existingValues.slice(0, index),
                ...pastedValues,
                ...existingValues.slice(index + 1),
            ]);
            replaceRows(
                nextValues.length
                    ? nextValues.map((uri) => ({ value: uri }))
                    : [createEmptyUriField()]
            );
        },
        [getValues, setValue]
    );

    const removeUriRow = useCallback((fields, removeRow, replaceRows, index) => {
        if (fields.length <= 1) {
            replaceRows([createEmptyUriField()]);
            return;
        }
        removeRow(index);
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitError('');
        const redirectUris = normalizeUriList(data.redirectUris);
        const postLogoutRedirectUris = normalizeUriList(data.postLogoutRedirectUris);
        const payload = {
            appName: data.appName,
            email: data.email,
            callbackUrl: redirectUris[0],
            agreementsAccepted: data.agreementsAccepted,
            logo_uri: normalizeOptionalValue(data.logoUri),
            client_uri: normalizeOptionalValue(data.clientUri),
            policy_uri: normalizeOptionalValue(data.policyUri),
            tos_uri: normalizeOptionalValue(data.tosUri),
            redirect_uris: redirectUris,
            post_logout_redirect_uris: postLogoutRedirectUris,
        };
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
            reset(createDefaultFormValues());
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
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Required</h2>
                                <p className={styles.sectionHint}>
                                    We use these to create your application record and contact you.
                                </p>
                            </div>
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

                            <hr className={styles.sectionDivider} />
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Optional: OAuth2 &amp; user data</h2>
                                <p className={styles.sectionHint}>
                                    Only needed if you plan to use OAuth2 flows or user-related APIs
                                </p>
                            </div>
                            <div className="margin-bottom--md">
                                <label className="form-label">Redirect URIs</label>
                                <div className={styles.uriList}>
                                    {redirectUriFields.map((field, index) => {
                                        const fieldError = errors.redirectUris?.[index]?.value;
                                        return (
                                            <div key={field.id} className={styles.uriRow}>
                                                <div className={styles.uriInput}>
                                                    <input
                                                        type="url"
                                                        id={`redirectUris-${index}`}
                                                        className={`form-input ${fieldError ? 'form-input-error' : ''}`}
                                                        placeholder="https://your-app.com/callback"
                                                        aria-label={`Redirect URI ${index + 1}`}
                                                        {...register(`redirectUris.${index}.value`, {
                                                            validate: validateSingleUri,
                                                        })}
                                                        onPaste={(event) =>
                                                            handleUriPaste(
                                                                event,
                                                                'redirectUris',
                                                                index,
                                                                replaceRedirectUris
                                                            )
                                                        }
                                                    />
                                                    {fieldError && (
                                                        <div className="error-message">
                                                            {fieldError.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.removeUriButton}
                                                    onClick={() =>
                                                        removeUriRow(
                                                            redirectUriFields,
                                                            removeRedirectUri,
                                                            replaceRedirectUris,
                                                            index
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    className={styles.addUriButton}
                                    onClick={() => appendRedirectUri(createEmptyUriField())}
                                >
                                    Add another redirect URI
                                </button>
                                <small className={clsx('text-muted', styles.uriHelpText)}>
                                    OAuth callback URLs. Add each callback URL in its own row.
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
                                <label className="form-label">Post-logout Redirect URIs</label>
                                <div className={styles.uriList}>
                                    {postLogoutRedirectUriFields.map((field, index) => {
                                        const fieldError =
                                            errors.postLogoutRedirectUris?.[index]?.value;
                                        return (
                                            <div key={field.id} className={styles.uriRow}>
                                                <div className={styles.uriInput}>
                                                    <input
                                                        type="url"
                                                        id={`postLogoutRedirectUris-${index}`}
                                                        className={`form-input ${fieldError ? 'form-input-error' : ''}`}
                                                        placeholder="https://your-app.com/"
                                                        aria-label={`Post-logout Redirect URI ${index + 1}`}
                                                        {...register(
                                                            `postLogoutRedirectUris.${index}.value`,
                                                            {
                                                                validate: validateSingleUri,
                                                            }
                                                        )}
                                                        onPaste={(event) =>
                                                            handleUriPaste(
                                                                event,
                                                                'postLogoutRedirectUris',
                                                                index,
                                                                replacePostLogoutRedirectUris
                                                            )
                                                        }
                                                    />
                                                    {fieldError && (
                                                        <div className="error-message">
                                                            {fieldError.message}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.removeUriButton}
                                                    onClick={() =>
                                                        removeUriRow(
                                                            postLogoutRedirectUriFields,
                                                            removePostLogoutRedirectUri,
                                                            replacePostLogoutRedirectUris,
                                                            index
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    className={styles.addUriButton}
                                    onClick={() =>
                                        appendPostLogoutRedirectUri(createEmptyUriField())
                                    }
                                >
                                    Add another post-logout URI
                                </button>
                                <small className={clsx('text-muted', styles.uriHelpText)}>
                                    Optional. Each post-logout URI must match the scheme, domain,
                                    and port of one redirect URI.
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
