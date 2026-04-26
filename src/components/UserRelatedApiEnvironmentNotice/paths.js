const PROD_CATEGORY_PATH = '/docs/category/user-related-apis';
const PRELIVE_CATEGORY_PATH = '/docs/category/user-related-apis-pre-live';
const PROD_LATEST_PREFIX = '/docs/user_related_apis_versioned/';
const PRELIVE_PREFIX = '/docs/user_related_apis_prelive/';
const PROD_VERSION_PREFIX_REGEX = /^\d+\.\d+\.\d+(\/|$)/;

const normalizePath = (value) =>
  value && value !== '/' ? value.replace(/\/+$/, '') : value;
const hasAvailablePath = (availablePaths, targetPath) => {
  const normalizedTargetPath = normalizePath(targetPath);

  return (
    availablePaths.has(normalizedTargetPath) ||
    availablePaths.has(`${normalizedTargetPath}/`)
  );
};
const stripPrefix = (value, prefix) => value.slice(prefix.length);
const getFallbackPath = (environment) =>
  environment === 'production' ? PROD_CATEGORY_PATH : PRELIVE_CATEGORY_PATH;

function getUserRelatedDocsAvailablePaths(allDocsData) {
  const paths = new Set();

  Object.values(allDocsData ?? {}).forEach((pluginData) => {
    pluginData?.versions?.forEach((version) => {
      version?.docs?.forEach((doc) => {
        if (typeof doc?.path === 'string') {
          paths.add(normalizePath(doc.path));
        }
      });
    });
  });

  return paths;
}

function getUserRelatedDocsEnvironment(pathname) {
  const normalizedPathname = normalizePath(pathname);

  if (
    normalizedPathname === PROD_CATEGORY_PATH ||
    normalizedPathname.startsWith(PROD_LATEST_PREFIX)
  ) {
    return 'production';
  }

  if (
    normalizedPathname === PRELIVE_CATEGORY_PATH ||
    normalizedPathname.startsWith(PRELIVE_PREFIX)
  ) {
    return 'pre-live';
  }

  return null;
}

function getTargetPath(pathname, targetEnvironment) {
  const normalizedPathname = normalizePath(pathname);
  const currentEnvironment = getUserRelatedDocsEnvironment(normalizedPathname);
  const fallbackPath = getFallbackPath(targetEnvironment);
  let targetPath = fallbackPath;

  if (currentEnvironment && currentEnvironment === targetEnvironment) {
    return {
      fallbackPath,
      targetPath: normalizedPathname,
    };
  }

  if (targetEnvironment === 'production') {
    if (normalizedPathname === PRELIVE_CATEGORY_PATH) {
      targetPath = PROD_CATEGORY_PATH;
    } else if (normalizedPathname.startsWith(PRELIVE_PREFIX)) {
      targetPath = `${PROD_LATEST_PREFIX}${stripPrefix(normalizedPathname, PRELIVE_PREFIX)}`;
    }
  } else if (targetEnvironment === 'pre-live') {
    if (normalizedPathname === PROD_CATEGORY_PATH) {
      targetPath = PRELIVE_CATEGORY_PATH;
    } else if (normalizedPathname.startsWith(PROD_LATEST_PREFIX)) {
      const relativePath = stripPrefix(normalizedPathname, PROD_LATEST_PREFIX);
      const normalizedRelativePath = relativePath.replace(PROD_VERSION_PREFIX_REGEX, '');

      targetPath = `${PRELIVE_PREFIX}${normalizedRelativePath}`;
    }
  } else {
    return {
      fallbackPath: normalizedPathname,
      targetPath: normalizedPathname,
    };
  }

  return {
    fallbackPath,
    targetPath,
  };
}

function getUserRelatedDocsTarget(pathname, targetEnvironment, options = {}) {
  const { fallbackPath, targetPath } = getTargetPath(pathname, targetEnvironment);
  const hasExplicitDocTarget = targetPath !== fallbackPath;
  const hasEquivalentDoc = !hasExplicitDocTarget || !options.availablePaths
    ? true
    : hasAvailablePath(options.availablePaths, targetPath);
  const path = hasEquivalentDoc ? targetPath : fallbackPath;

  return {
    hasEquivalentDoc,
    path,
  };
}

function getUserRelatedDocsPath(pathname, targetEnvironment, options = {}) {
  const { path } = getUserRelatedDocsTarget(pathname, targetEnvironment, options);

  return path;
}

module.exports = {
  PRELIVE_CATEGORY_PATH,
  PROD_CATEGORY_PATH,
  getUserRelatedDocsAvailablePaths,
  getUserRelatedDocsEnvironment,
  getUserRelatedDocsPath,
  getUserRelatedDocsTarget,
};
