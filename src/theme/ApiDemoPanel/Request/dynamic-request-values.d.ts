interface OpenApiExtension {
  readonly key?: string;
  readonly value?: unknown;
}

export function getCurrentTimestampFieldNames(
  extensions: readonly OpenApiExtension[] | undefined,
): string[];

export function applyDynamicRequestValues<T>(
  value: T,
  currentTimestampFieldNames: readonly string[],
  currentTimestamp?: string,
): T;

export function applyDynamicRequestBodyExamples<T>(
  requestBody: T,
  currentTimestampFieldNames: readonly string[],
  currentTimestamp?: string,
): T;
