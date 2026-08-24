"use strict";

const CURRENT_TIMESTAMP_FIELDS_EXTENSION =
  "x-qf-live-request-current-timestamp-fields";

function getCurrentTimestampFieldNames(extensions) {
  if (!Array.isArray(extensions)) {
    return [];
  }

  const extension = extensions.find(
    (candidate) => candidate?.key === CURRENT_TIMESTAMP_FIELDS_EXTENSION,
  );

  if (!Array.isArray(extension?.value)) {
    return [];
  }

  return extension.value.filter(
    (fieldName) => typeof fieldName === "string" && fieldName.length > 0,
  );
}

function replaceFields(value, fieldNames, replacement) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceFields(item, fieldNames, replacement));
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      fieldNames.has(key)
        ? replacement
        : replaceFields(child, fieldNames, replacement),
    ]),
  );
}

function applyDynamicRequestValues(
  value,
  currentTimestampFieldNames,
  currentTimestamp = new Date().toISOString(),
) {
  const fieldNames = new Set(currentTimestampFieldNames);
  if (fieldNames.size === 0) {
    return value;
  }

  return replaceFields(value, fieldNames, currentTimestamp);
}

function applyDynamicRequestBodyExamples(
  requestBody,
  currentTimestampFieldNames,
  currentTimestamp = new Date().toISOString(),
) {
  if (
    currentTimestampFieldNames.length === 0 ||
    requestBody === null ||
    typeof requestBody !== "object" ||
    requestBody.content === null ||
    typeof requestBody.content !== "object"
  ) {
    return requestBody;
  }

  const content = Object.fromEntries(
    Object.entries(requestBody.content).map(([contentType, mediaType]) => {
      if (mediaType === null || typeof mediaType !== "object") {
        return [contentType, mediaType];
      }

      const refreshedMediaType = { ...mediaType };
      if (Object.hasOwn(mediaType, "example")) {
        refreshedMediaType.example = applyDynamicRequestValues(
          mediaType.example,
          currentTimestampFieldNames,
          currentTimestamp,
        );
      }

      if (mediaType.examples && typeof mediaType.examples === "object") {
        refreshedMediaType.examples = Object.fromEntries(
          Object.entries(mediaType.examples).map(([name, example]) => {
            if (example === null || typeof example !== "object") {
              return [name, example];
            }

            return [
              name,
              {
                ...example,
                value: applyDynamicRequestValues(
                  example.value,
                  currentTimestampFieldNames,
                  currentTimestamp,
                ),
              },
            ];
          }),
        );
      }

      return [contentType, refreshedMediaType];
    }),
  );

  return { ...requestBody, content };
}

module.exports = {
  applyDynamicRequestBodyExamples,
  applyDynamicRequestValues,
  getCurrentTimestampFieldNames,
};
