const URI_PATTERN = /[a-z][a-z0-9+.-]*:\/\/[^\s"',\]]+/gi;

const createEmptyUriField = () => ({ value: '' });

const createDefaultFormValues = () => ({
    appName: '',
    email: '',
    callbackUrl: '',
    redirectUris: [createEmptyUriField()],
    logoUri: '',
    clientUri: '',
    policyUri: '',
    tosUri: '',
    postLogoutRedirectUris: [createEmptyUriField()],
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

    const urlMatches = trimmed.match(URI_PATTERN);
    if (urlMatches?.length) {
        return dedupeUriValues(urlMatches);
    }

    return dedupeUriValues(trimmed.split(/[\r\n,]+/));
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

const normalizeUriList = (value) =>
    dedupeUriValues(
        valuesFromUriField(value).flatMap((entry) => {
            const parsedValues = parsePastedUriValues(entry);
            return parsedValues.length ? parsedValues : [entry];
        })
    );

const toUriFields = (value) => {
    const uris = normalizeUriList(value);
    return uris.length ? uris.map((uri) => ({ value: uri })) : [createEmptyUriField()];
};

function sanitizeFormValues(values) {
    if (!values || typeof values !== 'object') {
        return createDefaultFormValues();
    }

    const redirectUris = toUriFields(
        values.redirectUris || values.redirect_uris || values.callbackUrl
    );
    const postLogoutRedirectUris = toUriFields(
        values.postLogoutRedirectUris || values.post_logout_redirect_uris
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
    dedupeUriValues,
    isEmptyFormValues,
    normalizeOptionalValue,
    normalizeUriList,
    parsePastedUriValues,
    sanitizeFormValues,
    validateSingleUri,
    valuesFromUriField,
};
