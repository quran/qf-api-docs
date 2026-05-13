import React, { type ReactNode } from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import {
  useHomePageRoute,
  useSidebarBreadcrumbs,
} from "@docusaurus/theme-common/internal";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { translate } from "@docusaurus/Translate";
import IconHome from "@theme/Icon/Home";

import styles from "./styles.module.css";

type BreadcrumbEntry = {
  href?: string;
  isHome?: boolean;
  label: ReactNode;
  schemaName: string;
};

type SchemaEntry = BreadcrumbEntry & {
  displayIndex: number;
  position: number;
};

const homeLabel = translate({
  id: "theme.docs.breadcrumbs.home",
  message: "Home page",
  description: "The ARIA label for the home page in the breadcrumbs",
});

function getSchemaEntries(entries: BreadcrumbEntry[]): SchemaEntry[] {
  const lastIndex = entries.length - 1;
  const candidates = entries
    .map((entry, displayIndex) => ({ ...entry, displayIndex }))
    .filter((entry) => entry.href || entry.displayIndex === lastIndex);

  if (candidates.length < 2) {
    return [];
  }

  return candidates.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}

function BreadcrumbsItemLink({
  children,
  href,
  isHome,
  isLast,
  schemaName,
  useMicrodata,
}: {
  children: ReactNode;
  href: string | undefined;
  isHome: boolean;
  isLast: boolean;
  schemaName: string;
  useMicrodata: boolean;
}): JSX.Element {
  const className = "breadcrumbs__link";

  if (isLast || !href) {
    return (
      <span className={className} {...(useMicrodata && { itemProp: "name" })}>
        {children}
      </span>
    );
  }

  return (
    <>
      <Link
        aria-label={isHome ? schemaName : undefined}
        className={className}
        href={href}
        {...(useMicrodata && { itemProp: "item" })}>
        {isHome || !useMicrodata ? (
          children
        ) : (
          <span itemProp="name">{children}</span>
        )}
      </Link>
      {isHome && useMicrodata && <meta itemProp="name" content={schemaName} />}
    </>
  );
}

function BreadcrumbsItem({
  active,
  children,
  position,
  useMicrodata,
}: {
  active?: boolean;
  children: ReactNode;
  position?: number;
  useMicrodata: boolean;
}): JSX.Element {
  return (
    <li
      {...(useMicrodata && {
        itemScope: true,
        itemProp: "itemListElement",
        itemType: "https://schema.org/ListItem",
      })}
      className={clsx("breadcrumbs__item", {
        "breadcrumbs__item--active": active,
      })}>
      {children}
      {useMicrodata && <meta itemProp="position" content={String(position)} />}
    </li>
  );
}

function HomeIcon() {
  return <IconHome className={styles.breadcrumbHomeIcon} />;
}

export default function DocBreadcrumbs(): JSX.Element | null {
  const breadcrumbs = useSidebarBreadcrumbs();
  const homePageRoute = useHomePageRoute();
  const homeHref = useBaseUrl("/");

  if (!breadcrumbs) {
    return null;
  }

  const entries: BreadcrumbEntry[] = [
    ...(homePageRoute
      ? [
          {
            href: homeHref,
            isHome: true,
            label: <HomeIcon />,
            schemaName: homeLabel,
          },
        ]
      : []),
    ...breadcrumbs.map((item) => ({
      href: item.href,
      label: item.label,
      schemaName: item.label,
    })),
  ];
  const schemaEntries = getSchemaEntries(entries);
  const useBreadcrumbListMicrodata = schemaEntries.length >= 2;

  return (
    <nav
      className={clsx(
        ThemeClassNames.docs.docBreadcrumbs,
        styles.breadcrumbsContainer,
      )}
      aria-label={translate({
        id: "theme.docs.breadcrumbs.navAriaLabel",
        message: "Breadcrumbs",
        description: "The ARIA label for the breadcrumbs",
      })}>
      <ul
        className="breadcrumbs"
        {...(useBreadcrumbListMicrodata && {
          itemScope: true,
          itemType: "https://schema.org/BreadcrumbList",
        })}>
        {entries.map((entry, displayIndex) => {
          const isLast = displayIndex === entries.length - 1;
          const schemaEntry = schemaEntries.find(
            (item) => item.displayIndex === displayIndex,
          );
          const useMicrodata =
            useBreadcrumbListMicrodata && Boolean(schemaEntry);

          return (
            <BreadcrumbsItem
              key={displayIndex}
              active={isLast}
              position={schemaEntry?.position}
              useMicrodata={useMicrodata}>
              <BreadcrumbsItemLink
                href={entry.href}
                isHome={Boolean(entry.isHome)}
                isLast={isLast}
                schemaName={entry.schemaName}
                useMicrodata={useMicrodata}>
                {entry.label}
              </BreadcrumbsItemLink>
            </BreadcrumbsItem>
          );
        })}
      </ul>
    </nav>
  );
}
