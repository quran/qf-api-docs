import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import { useForm } from 'react-hook-form';
import styles from './request-access.module.css';


export default function RequestAccess() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // "benefits" | "disclaimers"

    const benefitPoints = [
        "Comprehensive APIs, backend, and managed data so you can focus on solving unique problems.",
        "Opportunity to be featured on Quran.com via Quran App Portal.",
        "Direct support from Quran Foundation and its broader network.",
        "Reliable, copyrighted, scholarly verified content.",
        "Mission-driven community that prioritizes da'wah impact.",
        "Users can bring their reading history, bookmarks, saved verses, notes, reflections, and streaks into your app.",
        "Full feature set from Quran.com and QuranReflect, plus OAuth and a notification engine.",
        "Funding or in-kind support for high-value projects aligned with Quran Foundation plans.",
    ];

    const disclaimerPoints = [
        "Building a Quranic or guidance app puts you in a da'wah role, clarify your references and scholars, and consult them on content, behavior design, priorities, and potential harms.",
        "Respect copyrights and licensing expectations.",
        "Honor scholarly review and keep content aligned with verified sources.",
        "Use the API to keep content accurate as removals, additions, or edits occur.",
        "Examine intention and risks, your product shapes hearts and behavior.",
        "Focus on solving unique problems; the ummah needs more coverage than current resources provide.",
        "Decide your commercial stance with scholars; if allowed, follow guidelines for both developers and Quran Foundation collaboration.",
        "Practice ta'awun (Quranic collaboration) with the wider ecosystem.",
        "Align with our vision and architecture (auth, user features, notifications) to receive support.",
    ];

    const closeModal = useCallback(() => setActiveModal(null), []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeModal]);

    const renderModal = (title, points, ctaLabel) => {
        if (activeModal === null) return null;
        return (
            <div
                className={styles.modalOverlay}
                role="dialog"
                aria-modal="true"
                onClick={closeModal}
            >
                <div
                    className={styles.modalCard}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>{title}</h3>
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={closeModal}
                            aria-label="Close dialog"
                        >
                            ×
                        </button>
                    </div>
                    <ul className={styles.modalList}>
                        {points.map((point) => (
                            <li key={point}>{point}</li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        className={clsx('button button--primary button--md', styles.modalCta)}
                        onClick={closeModal}
                    >
                        {ctaLabel}
                    </button>
                </div>
            </div>
        );
    };

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

                            <button
                                type="submit"
                                className="button button--primary button--block"
                                disabled={isSubmitting}
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

            {activeModal === 'benefits' &&
                renderModal('Developer Benefits', benefitPoints, 'Got it')}
            {activeModal === 'disclaimers' &&
                renderModal('Developer Disclaimers', disclaimerPoints, 'Understood')}
        </Layout>
    );
}
