import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useForm } from 'react-hook-form';
import styles from './request-access.module.css';
import {
    DeveloperBenefitsModal,
    DeveloperDisclaimersModal,
} from '@site/src/components/DeveloperModals';


export default function RequestAccess() {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // "benefits" | "disclaimers"
    const hasAcceptedTerms = watch('agreementsAccepted', false);

    const closeModal = useCallback(() => setActiveModal(null), []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`https://qf-form-handler.fly.dev/api/v1/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setSubmitStatus('success');
            reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
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
                                    Callback URL
                                </label>
                                <input
                                    type="url"
                                    id="callbackUrl"
                                    className="form-input"
                                    {...register('callbackUrl')}
                                />
                                <small className="text-muted">
                                    Optional: Provide a callback URL if you're planning to use OAuth2 authentication
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
                                        <Link to="/legal/developer-terms">
                                            Quran Foundation Developer Terms of Service
                                        </Link>{' '}
                                        and the{' '}
                                        <Link to="/legal/developer-privacy">
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
                                    There was an error submitting your request. Please try again later.
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
