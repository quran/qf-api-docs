import type { Scheme } from "@theme/ApiDemoPanel/Authorization/slice";
import type { ServerObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";

export const AUTH_LABELS: Record<string, string> = {
  "x-auth-token": "Access Token",
  "x-client-id": "Client ID",
};

export interface SelectOption {
  label: string;
  value: string;
}

export type SelectOptionInput = string | number | boolean | SelectOption;

export interface AuthFieldMeta {
  dataKey: string;
  label: string;
  helperText?: string;
  description?: string;
  password?: boolean;
  placeholder?: string;
}

function toWords(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return toWords(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function joinSentences(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isSensitiveIdentifier(value?: string) {
  if (!value) {
    return false;
  }

  return /token|secret|password|authorization|bearer|api[-_ ]?key/i.test(
    value
  );
}

export function prettifyIdentifier(value?: string) {
  if (!value) {
    return "";
  }

  return titleCase(value);
}

export function getLocationLabel(value?: string) {
  if (!value) {
    return "";
  }

  switch (value) {
    case "path":
      return "Path";
    case "query":
      return "Query";
    case "header":
      return "Header";
    case "cookie":
      return "Cookie";
    default:
      return prettifyIdentifier(value);
  }
}

export function resolveServerLabel(server: ServerObject, index: number) {
  return server.description || `Server ${index + 1}`;
}

export function resolveServerUrl(server?: ServerObject) {
  if (!server) {
    return "";
  }

  let url = server.url.replace(/\/$/, "");
  if (server.variables) {
    Object.keys(server.variables).forEach((variable) => {
      url = url.replace(
        `{${variable}}`,
        String(server.variables?.[variable].default ?? "")
      );
    });
  }

  return url;
}

export function resolveSchemeDisplayName(scheme: Scheme) {
  if (scheme.type === "http" && scheme.scheme === "bearer") {
    return "Access Token";
  }

  if (scheme.type === "oauth2") {
    return "OAuth2 Access Token";
  }

  if (scheme.type === "http" && scheme.scheme === "basic") {
    return "Basic Authentication";
  }

  if (scheme.type === "apiKey") {
    const rawName = scheme.name || scheme.key;
    return AUTH_LABELS[rawName] || prettifyIdentifier(rawName);
  }

  return prettifyIdentifier(scheme.name || scheme.key);
}

export function resolveSchemeOptionLabel(optionId: string, schemes: Scheme[]) {
  const labels = schemes
    .map((scheme) => resolveSchemeDisplayName(scheme))
    .filter((label, index, array) => array.indexOf(label) === index);

  return labels.length > 0 ? labels.join(" + ") : prettifyIdentifier(optionId);
}

export function resolveAuthFieldMeta(scheme: Scheme): AuthFieldMeta[] {
  if (scheme.type === "http" && scheme.scheme === "bearer") {
    return [
      {
        dataKey: "token",
        label: "Access Token",
        description: scheme.description,
        helperText: joinSentences([
          "Header: Authorization.",
          "Sent as Bearer <token>.",
        ]),
        password: true,
        placeholder: "Paste a bearer token",
      },
    ];
  }

  if (scheme.type === "oauth2") {
    return [
      {
        dataKey: "token",
        label: "Access Token",
        description: scheme.description,
        helperText: joinSentences([
          "Header: Authorization.",
          "Sent as Bearer <token>.",
        ]),
        password: true,
        placeholder: "Paste an OAuth2 access token",
      },
    ];
  }

  if (scheme.type === "http" && scheme.scheme === "basic") {
    return [
      {
        dataKey: "username",
        label: "Username",
        description: scheme.description,
        helperText: "Sent via the Authorization header using HTTP Basic auth.",
        placeholder: "Enter a username",
      },
      {
        dataKey: "password",
        label: "Password",
        helperText: "Sent via the Authorization header using HTTP Basic auth.",
        password: true,
        placeholder: "Enter a password",
      },
    ];
  }

  if (scheme.type === "apiKey") {
    const rawName = scheme.name || scheme.key;
    const label = AUTH_LABELS[rawName] || prettifyIdentifier(rawName);

    return [
      {
        dataKey: "apiKey",
        label,
        description: scheme.description,
        helperText: joinSentences([
          rawName ? `Header: ${rawName}.` : undefined,
          scheme.in ? `Location: ${getLocationLabel(scheme.in)}.` : undefined,
        ]),
        password: rawName !== "x-client-id" && isSensitiveIdentifier(rawName),
        placeholder: `Enter ${label.toLowerCase()}`,
      },
    ];
  }

  return [];
}

export function normalizeSelectOptions(options?: SelectOptionInput[]) {
  return (options || []).map((option) => {
    if (
      typeof option === "string" ||
      typeof option === "number" ||
      typeof option === "boolean"
    ) {
      const normalizedOption = String(option);
      return { label: normalizedOption, value: normalizedOption };
    }

    return option;
  });
}
