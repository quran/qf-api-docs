import React from "react";
import Link from "@docusaurus/Link";
import { useAllDocsData } from "@docusaurus/plugin-content-docs/client";
import clsx from "clsx";

import styles from "./styles.module.css";
import {
  getUserRelatedDocsAvailablePaths,
  getUserRelatedDocsEnvironment,
  getUserRelatedDocsTarget,
} from "./paths";

type Props = {
  hash?: string;
  pathname: string;
  search?: string;
};

const LABELS = {
  production: "Production",
  "pre-live": "Pre-live",
} as const;

const getCopy = (environment: "production" | "pre-live") => {
  if (environment === "pre-live") {
    return {
      title: "Pre-live user-related API docs",
      body: "",
    };
  }

  return {
    title: "Production user-related API docs",
    body: "",
  };
};

export default function UserRelatedApiEnvironmentNotice({
  hash = "",
  pathname,
  search = "",
}: Props) {
  const allDocsData = useAllDocsData();
  const availablePaths = React.useMemo(
    () => getUserRelatedDocsAvailablePaths(allDocsData),
    [allDocsData],
  );
  const environment = getUserRelatedDocsEnvironment(pathname);

  if (!environment) {
    return null;
  }

  const copy = getCopy(environment);

  return (
    <div
      className={clsx(styles.notice, {
        [styles.noticePrelive]: environment === "pre-live",
      })}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>User-related API environment</p>
          <h2 className={styles.title}>{copy.title}</h2>
        </div>
        <nav
          className={styles.switcher}
          aria-label="User-related API environment switcher"
        >
          {(["production", "pre-live"] as const).map((targetEnvironment) => {
            const { hasEquivalentDoc, path: targetPath } =
              getUserRelatedDocsTarget(pathname, targetEnvironment, {
                availablePaths,
              });
            const href = `${targetPath}${search}${hash}`;
            const isActive = targetEnvironment === environment;
            const isUnavailable = !isActive && !hasEquivalentDoc;

            if (isUnavailable) {
              return (
                <span
                  key={targetEnvironment}
                  className={clsx(
                    styles.switcherLink,
                    styles.switcherLinkDisabled,
                  )}
                  title={`No equivalent ${LABELS[targetEnvironment]} page for this endpoint`}
                  aria-disabled="true"
                >
                  {LABELS[targetEnvironment]}
                </span>
              );
            }

            return (
              <Link
                key={targetEnvironment}
                className={clsx(styles.switcherLink, {
                  [styles.switcherLinkActive]: isActive,
                })}
                aria-current={isActive ? "page" : undefined}
                to={href}
              >
                {LABELS[targetEnvironment]}
              </Link>
            );
          })}
        </nav>
      </div>
      <p className={styles.body}>{copy.body}</p>
    </div>
  );
}
