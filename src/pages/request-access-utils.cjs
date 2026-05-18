const URI_PATTERN = /[a-z][a-z0-9+.-]*:\/\/[^\s"',\]]+/gi;
const QUOTED_URI_SEPARATOR_PATTERN = /["']\s*,\s*["']/;
const URI_LIST_SEPARATOR_PATTERN = /,\s*[a-z][a-z0-9+.-]*:\/\//i;

const DEFAULT_URI_FIELD_COUNT = 3;

const createEmptyUriField = () => ({ value: '' });

const createDefaultUriFields = () =>
    Array.from({ length: DEFAULT_URI_FIELD_COUNT }, () => createEmptyUriField());

const createDefaultFormValues = () => ({
    appName: '',
    email: '',
    callbackUrl: '',
    redirectUris: createDefaultUriFields(),
    logoUri: '',
    clientUri: '',
    policyUri: '',
    tosUri: '',
    postLogoutRedirectUris: createDefaultUriFields(),
    agreementsAccepted: false,
});

const normalizeOptionalValue = (value) => {
    if (typeof value !== 'string') {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
};

const cleanUriToken = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .trim()
        .replace(/^\s*[-*]\s+/, '')
        .replace(/^[\s"'`\[\],]+/, '')
        .replace(/[\s"'`\],]+$/, '')
        .trim();
};

const dedupeUriValues = (values) => {
    const deduped = [];
    const seen = new Set();

    values.forEach((value) => {
        const uri = cleanUriToken(value);
        if (!uri || seen.has(uri)) {
            return;
        }

        seen.add(uri);
        deduped.push(uri);
    });

    return deduped;
};

const isValidSingleUriValue = (value) => {
    if (!value || /\s/.test(value)) {
        return false;
    }

    try {
        new URL(value);
        return true;
    } catch (error) {
        return false;
    }
};

const hasUriListSeparatorBeforeQuery = (value) => {
    const separatorMatch = value.match(URI_LIST_SEPARATOR_PATTERN);
    if (!separatorMatch || typeof separatorMatch.index !== 'number') {
        return false;
    }

    const queryIndex = value.search(/[?#]/);
    return queryIndex === -1 || separatorMatch.index < queryIndex;
};

const parsePastedUriValues = (value) => {
    if (typeof value !== 'string') {
        return [];
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return [];
    }

    if (trimmed.startsWith('[')) {
        try {
            const parsedValue = JSON.parse(trimmed);
            if (Array.isArray(parsedValue)) {
                return dedupeUriValues(parsedValue);
            }
        } catch (error) {
            // Fall through to forgiving text parsing for JSON-ish snippets.
        }
    }

    const cleanedValue = cleanUriToken(trimmed);
    if (
        !/[\r\n]/.test(trimmed) &&
        !QUOTED_URI_SEPARATOR_PATTERN.test(trimmed) &&
        isValidSingleUriValue(cleanedValue) &&
        !hasUriListSeparatorBeforeQuery(cleanedValue)
    ) {
        return [cleanedValue];
    }

    if (/[\r\n]/.test(trimmed)) {
        return dedupeUriValues(trimmed.split(/[\r\n]+/));
    }

    if (QUOTED_URI_SEPARATOR_PATTERN.test(trimmed)) {
        try {
            const parsedValue = JSON.parse(`[${trimmed}]`);
            if (Array.isArray(parsedValue)) {
                return dedupeUriValues(parsedValue);
            }
        } catch (error) {
            // Fall through to URI matching for JSON-ish snippets.
        }
    }

    const urlMatches = trimmed.match(URI_PATTERN);
    if (urlMatches?.length) {
        return dedupeUriValues(urlMatches);
    }

    return [];
};

const valuesFromUriField = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((entry) => {
            if (typeof entry === 'string') {
                return [entry];
            }
            if (entry && typeof entry.value === 'string') {
                return [entry.value];
            }
            return [];
        });
    }

    if (typeof value === 'string') {
        return [value];
    }

    return [];
};

const normalizeUriList = (value) => dedupeUriValues(valuesFromUriField(value));

const normalizeLegacyUriList = (value) =>
    dedupeUriValues(
        valuesFromUriField(value).flatMap((entry) => {
            const parsedValues = parsePastedUriValues(entry);
            return parsedValues.length > 1 ? parsedValues : [entry];
        })
    );

const toUriFields = (value, parseLegacyValue = false) => {
    const uris = parseLegacyValue ? normalizeLegacyUriList(value) : normalizeUriList(value);
    return uris.length ? uris.map((uri) => ({ value: uri })) : createDefaultUriFields();
};

function sanitizeFormValues(values) {
    if (!values || typeof values !== 'object') {
        return createDefaultFormValues();
    }

    const redirectUriSource = values.redirectUris || values.redirect_uris || values.callbackUrl;
    const postLogoutRedirectUriSource =
        values.postLogoutRedirectUris || values.post_logout_redirect_uris;
    const redirectUris = toUriFields(
        redirectUriSource,
        typeof redirectUriSource === 'string'
    );
    const postLogoutRedirectUris = toUriFields(
        postLogoutRedirectUriSource,
        typeof postLogoutRedirectUriSource === 'string'
    );

    return {
        ...createDefaultFormValues(),
        appName: typeof values.appName === 'string' ? values.appName : '',
        email: typeof values.email === 'string' ? values.email : '',
        callbackUrl: redirectUris[0]?.value || '',
        redirectUris,
        logoUri: typeof values.logoUri === 'string' ? values.logoUri : '',
        clientUri: typeof values.clientUri === 'string' ? values.clientUri : '',
        policyUri: typeof values.policyUri === 'string' ? values.policyUri : '',
        tosUri: typeof values.tosUri === 'string' ? values.tosUri : '',
        postLogoutRedirectUris,
        agreementsAccepted: Boolean(values.agreementsAccepted),
    };
}

function isEmptyFormValues(values) {
    return (
        !values.appName &&
        !values.email &&
        !normalizeUriList(values.redirectUris).length &&
        !values.logoUri &&
        !values.clientUri &&
        !values.policyUri &&
        !values.tosUri &&
        !normalizeUriList(values.postLogoutRedirectUris).length &&
        !values.agreementsAccepted
    );
}

const validateSingleUri = (value) => {
    const uri = normalizeOptionalValue(value);
    if (!uri) {
        return true;
    }

    if (/\s/.test(uri)) {
        return 'Enter one URI per row';
    }

    try {
        new URL(uri);
        return true;
    } catch (error) {
        return 'Enter a valid URL';
    }
};

module.exports = {
    createDefaultFormValues,
    createEmptyUriField,
    createDefaultUriFields,
    dedupeUriValues,
    isEmptyFormValues,
    normalizeOptionalValue,
    normalizeUriList,
    parsePastedUriValues,
    sanitizeFormValues,
    validateSingleUri,
    valuesFromUriField,
};
