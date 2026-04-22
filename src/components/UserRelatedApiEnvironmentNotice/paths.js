const PROD_CATEGORY_PATH = '/docs/category/user-related-apis';
const PRELIVE_CATEGORY_PATH = '/docs/category/user-related-apis-pre-live';
const PROD_INTRO_PATH = '/docs/user_related_apis_versioned/user-related-apis';
const PRELIVE_INTRO_PATH = '/docs/user_related_apis_prelive/user-related-apis';
const PROD_LATEST_PREFIX = '/docs/user_related_apis_versioned/';
const PRELIVE_PREFIX = '/docs/user_related_apis_prelive/';
const PROD_VERSION_PREFIX_REGEX = /^\d+\.\d+\.\d+(\/|$)/;

const stripPrefix = (value, prefix) => value.slice(prefix.length);
const getFallbackPath = (environment) =>
  environment === 'production' ? PROD_INTRO_PATH : PRELIVE_INTRO_PATH;

function getUserRelatedDocsAvailablePaths(allDocsData) {
  const paths = new Set();

  Object.values(allDocsData ?? {}).forEach((pluginData) => {
    pluginData?.versions?.forEach((version) => {
      version?.docs?.forEach((doc) => {
        if (typeof doc?.path === 'string') {
          paths.add(doc.path);
        }
      });
    });
  });

  return paths;
}

function getUserRelatedDocsEnvironment(pathname) {
  if (
    pathname === PROD_CATEGORY_PATH ||
    pathname.startsWith(PROD_LATEST_PREFIX)
  ) {
    return 'production';
  }

  if (
    pathname === PRELIVE_CATEGORY_PATH ||
    pathname.startsWith(PRELIVE_PREFIX)
  ) {
    return 'pre-live';
  }

  return null;
}

function getTargetPath(pathname, targetEnvironment) {
  const currentEnvironment = getUserRelatedDocsEnvironment(pathname);
  const fallbackPath = getFallbackPath(targetEnvironment);
  let targetPath = fallbackPath;

  if (currentEnvironment && currentEnvironment === targetEnvironment) {
    return {
      fallbackPath,
      targetPath: pathname,
    };
  }

  if (targetEnvironment === 'production') {
    if (pathname === PRELIVE_CATEGORY_PATH) {
      targetPath = PROD_CATEGORY_PATH;
    } else if (pathname.startsWith(PRELIVE_PREFIX)) {
      targetPath = `${PROD_LATEST_PREFIX}${stripPrefix(pathname, PRELIVE_PREFIX)}`;
    }
  } else if (targetEnvironment === 'pre-live') {
    if (pathname === PROD_CATEGORY_PATH) {
      targetPath = PRELIVE_CATEGORY_PATH;
    } else if (pathname.startsWith(PROD_LATEST_PREFIX)) {
      const relativePath = stripPrefix(pathname, PROD_LATEST_PREFIX);
      const normalizedRelativePath = relativePath.replace(PROD_VERSION_PREFIX_REGEX, '');

      targetPath = `${PRELIVE_PREFIX}${normalizedRelativePath}`;
    }
  } else {
    return {
      fallbackPath: pathname,
      targetPath: pathname,
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
    : options.availablePaths.has(targetPath);
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
