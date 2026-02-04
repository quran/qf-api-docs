/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ==========================================================================
 */

import React, { useEffect, useState } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import codegen from "@paloaltonetworks/postman-code-generators";
import sdk from "@paloaltonetworks/postman-collection";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import CodeTabs from "@theme/ApiDemoPanel/CodeTabs";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import CodeBlock from "@theme/CodeBlock";
import clsx from "clsx";
import merge from "lodash/merge";

import styles from "./styles.module.css";

export interface Language {
  highlight?: string;
  language: string;
  logoClass?: string;
  variant?: string;
  options?: { [key: string]: boolean };
  source?: string;
  label?: string;
}

interface RedocCodeSample {
  lang?: string;
  label?: string;
  source?: string;
  language?: string;
  highlight?: string;
  logoClass?: string;
  variant?: string;
  options?: { [key: string]: boolean };
}

const AI_FALLBACK_LABEL = "AI Prompt";

export const languageSet: Language[] = [
  {
    highlight: "bash",
    language: "curl",
    logoClass: "bash",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
  },
  {
    highlight: "python",
    language: "python",
    logoClass: "python",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "requests",
  },
  {
    highlight: "go",
    language: "go",
    logoClass: "go",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "native",
  },
  {
    highlight: "javascript",
    language: "nodejs",
    logoClass: "nodejs",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "axios",
  },
  {
    highlight: "ruby",
    language: "ruby",
    logoClass: "ruby",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "Net::HTTP",
  },
  {
    highlight: "csharp",
    language: "csharp",
    logoClass: "csharp",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestSharp",
  },
  {
    highlight: "php",
    language: "php",
    logoClass: "php",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
  },
  {
    highlight: "java",
    language: "java",
    logoClass: "java",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "OkHttp",
  },
  {
    highlight: "powershell",
    language: "powershell",
    logoClass: "powershell",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestMethod",
  },
  {
    highlight: "text",
    language: "ai",
    logoClass: "ai",
    variant: "Prompt",
  },
];

export interface Props {
  postman: sdk.Request;
  codeSamples: any; // TODO: Type this...
}

function CodeTab({ children, hidden, className }: any): JSX.Element {
  return (
    <div
      role="tabpanel"
      className={clsx(styles.tabItem, className)}
      {...{ hidden }}
    >
      {children}
    </div>
  );
}

function sanitizeLabel(label?: string, fallback?: string) {
  if (!label) {
    return fallback ?? "";
  }
  const sanitized = label.replace(/[^\x20-\x7E]/g, "").trim();
  return sanitized || fallback || "";
}

function mapRedocSample(sample: RedocCodeSample): Language | null {
  const lang = sample.lang;
  if (!lang) {
    return null;
  }

  const source = sample.source ?? "";
  if (!source) {
    return null;
  }

  switch (lang) {
    case "javascript": {
      const label = sanitizeLabel(sample.label, "Node.js");
      return {
        language: "nodejs",
        highlight: "javascript",
        logoClass: "nodejs",
        variant: label,
        label,
        source,
      };
    }
    case "python": {
      const label = sanitizeLabel(sample.label, "Python");
      return {
        language: "python",
        highlight: "python",
        logoClass: "python",
        variant: label,
        label,
        source,
      };
    }
    case "bash": {
      const label = sanitizeLabel(sample.label, "cURL");
      return {
        language: "curl",
        highlight: "bash",
        logoClass: "bash",
        variant: label,
        label,
        source,
      };
    }
    case "text": {
      const label = sanitizeLabel(sample.label, AI_FALLBACK_LABEL);
      return {
        language: "ai",
        highlight: "text",
        logoClass: "ai",
        variant: label,
        label,
        source,
      };
    }
    default: {
      const label = sanitizeLabel(sample.label, "Sample");
      return {
        language: lang,
        highlight: lang,
        logoClass: lang,
        variant: label,
        label,
        source,
      };
    }
  }
}

function normalizeCodeSamples(samples: any): Language[] {
  if (!Array.isArray(samples)) {
    return [];
  }

  const normalized: Language[] = [];
  const seen = new Set<string>();

  for (const sample of samples) {
    if (!sample) {
      continue;
    }

    if (sample.language) {
      const existing = sample as Language;
      if (!existing.language || seen.has(existing.language)) {
        continue;
      }
      normalized.push(existing);
      seen.add(existing.language);
      continue;
    }

    const mapped = mapRedocSample(sample);
    if (!mapped || !mapped.language || seen.has(mapped.language)) {
      continue;
    }
    normalized.push(mapped);
    seen.add(mapped.language);
  }

  return normalized;
}

function mergeLanguageTabs(base: Language[], overrides: Language[]): Language[] {
  if (!overrides.length) {
    return base;
  }

  const baseByLanguage = new Map<string, Language>();
  const merged: Language[] = [];

  for (const lang of base) {
    if (!lang?.language) {
      continue;
    }
    baseByLanguage.set(lang.language, lang);
    merged.push(lang);
  }

  const seen = new Set(baseByLanguage.keys());
  for (const override of overrides) {
    if (!override?.language) {
      continue;
    }

    if (baseByLanguage.has(override.language)) {
      const index = merged.findIndex(
        (lang) => lang.language === override.language
      );
      if (index >= 0) {
        merged[index] = { ...baseByLanguage.get(override.language), ...override };
      }
    } else if (!seen.has(override.language)) {
      merged.push(override);
      seen.add(override.language);
    }
  }

  return merged;
}

function Curl({ postman, codeSamples }: Props) {
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const body = useTypedSelector((state: any) => state.body);

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);

  const auth = useTypedSelector((state: any) => state.auth);

  const rawCodeSamples = Array.isArray(codeSamples) ? codeSamples : [];
  const normalizedCodeSamples = normalizeCodeSamples(rawCodeSamples);
  const useCuratedSamples = normalizedCodeSamples.length > 0;

  const configuredLanguageTabs =
    (siteConfig?.themeConfig?.languageTabs as Language[] | undefined) ??
    languageSet;
  const baseLanguageTabs = configuredLanguageTabs.filter(
    (lang) => lang.language !== "ai"
  );

  // User-defined languages array
  // Can override languageSet, change order of langs, override options and variants
  const overrideSamples = useCuratedSamples
    ? normalizedCodeSamples
    : rawCodeSamples;
  const langs = mergeLanguageTabs(baseLanguageTabs, overrideSamples);

  // Filter languageSet by user-defined langs
  const filteredLanguageSet = languageSet.filter((ls) => {
    return langs.some((lang) => {
      return lang.language === ls.language;
    });
  });

  // Merge user-defined langs into languageSet
  const mergedLangs = merge(filteredLanguageSet, langs);

  // Read defaultLang from localStorage
  const storedLang =
    typeof window !== "undefined"
      ? localStorage.getItem("docusaurus.tab.code-samples")
      : null;
  const defaultLang: Language[] = mergedLangs.filter(
    (lang) => lang.language === storedLang
  );

  const [language, setLanguage] = useState(() => {
    // Return first index if only 1 user-defined language exists
    if (mergedLangs.length === 1) {
      return mergedLangs[0];
    }
    // Fall back to language in localStorage or first user-defined language
    return defaultLang[0] ?? mergedLangs[0];
  });

  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    if (language && !!language.source) {
      setCodeText(language.source);
    } else if (language && !!language.options) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });

      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else if (language && !language.options) {
      const langSource = mergedLangs.filter(
        (lang) => lang.language === language.language
      );

      // Merges user-defined language with default languageSet
      // This allows users to define only the minimal properties necessary in languageTabs
      // User-defined properties should override languageSet properties
      const mergedLanguage = { ...langSource[0], ...language };
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });

      codegen.convert(
        mergedLanguage.language,
        mergedLanguage.variant,
        postmanRequest,
        mergedLanguage.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else {
      setCodeText("");
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    server,
    auth,
    mergedLangs,
  ]);

  if (language === undefined) {
    return null;
  }

  const handleSetLanguage = (langFromTabs?: Language) => {
    if (!langFromTabs?.language) {
      return;
    }
    const resolved =
      mergedLangs.find((lang) => lang.language === langFromTabs.language) ??
      langFromTabs;
    setLanguage(resolved);
  };

  return (
    <>
      <CodeTabs groupId="code-samples" action={handleSetLanguage}>
        {mergedLangs.map((lang) => {
          const tabLabel = lang.language === "ai" ? lang.label : "";
          return (
            <CodeTab
              value={lang.language}
              label={tabLabel}
              key={
                lang.variant
                  ? `${lang.language}-${lang.variant}`
                  : lang.language
              }
              attributes={{ className: `code__tab--${lang.logoClass}` }}
            >
              <CodeBlock
                language={lang.highlight}
                className={styles.codeBlock}
                title={`${lang.language} / ${lang.variant}`}
              >
                {codeText}
              </CodeBlock>
            </CodeTab>
          );
        })}
      </CodeTabs>
    </>
  );
}

export default Curl;
