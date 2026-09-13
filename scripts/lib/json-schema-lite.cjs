/**
 * Dependency-free validator for the JSON Schema draft-07 subset used by the repository's
 * contract schemas. Deliberately small: the contract schemas are committed alongside it, so
 * this only has to be correct for the keywords they actually use, and it keeps a policy-critical
 * CI check off the dependency tree.
 *
 * Supported: $ref (local "#/..." pointers), type, const, enum, required, properties,
 * additionalProperties (boolean or schema), items, minItems, maxItems, uniqueItems, minLength,
 * maxLength, minimum, maximum, pattern, allOf, anyOf, oneOf, not, contains.
 *
 * Any keyword outside that list is reported as an error rather than silently ignored, so a
 * schema can never appear to pass because this validator did not understand it.
 */

const SUPPORTED = new Set([
  '$ref',
  '$schema',
  '$id',
  '$comment',
  'title',
  'description',
  'definitions',
  'default',
  'examples',
  'type',
  'const',
  'enum',
  'required',
  'properties',
  'additionalProperties',
  'items',
  'minItems',
  'maxItems',
  'uniqueItems',
  'minLength',
  'maxLength',
  'minimum',
  'maximum',
  'pattern',
  'allOf',
  'anyOf',
  'oneOf',
  'not',
  'contains',
]);

const typeOf = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
};

const typeMatches = (value, expected) => {
  const actual = typeOf(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  if (expected === 'integer') return actual === 'integer';
  return actual === expected;
};

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const resolveRef = (root, ref) => {
  if (!ref.startsWith('#/')) {
    throw new Error(`unsupported $ref ${ref}: only local #/ pointers are supported`);
  }
  let node = root;
  for (const rawSegment of ref.slice(2).split('/')) {
    const segment = rawSegment.replace(/~1/gu, '/').replace(/~0/gu, '~');
    node = node?.[segment];
    if (node === undefined) throw new Error(`unresolvable $ref ${ref}`);
  }
  return node;
};

/**
 * @param {unknown} value      document to validate
 * @param {object} schema      schema node
 * @param {object} root        root schema, for $ref resolution
 * @param {string} pointer     JSON pointer of `value`, for error messages
 * @param {string[]} errors    accumulator
 * @returns {string[]} errors
 */
const validateNode = (value, schema, root, pointer, errors) => {
  if (schema === true) return errors;
  if (schema === false) {
    errors.push(`${pointer}: schema forbids any value here`);
    return errors;
  }

  if (schema.$ref) {
    validateNode(value, resolveRef(root, schema.$ref), root, pointer, errors);
  }

  if (schema.type !== undefined) {
    const expected = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!expected.some((t) => typeMatches(value, t))) {
      errors.push(`${pointer}: expected type ${expected.join('|')}, got ${typeOf(value)}`);
      return errors;
    }
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum !== undefined && !schema.enum.some((option) => deepEqual(value, option))) {
    errors.push(`${pointer}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${pointer}: shorter than minLength ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`${pointer}: longer than maxLength ${schema.maxLength}`);
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, 'u').test(value)) {
      errors.push(`${pointer}: ${JSON.stringify(value)} does not match pattern ${schema.pattern}`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${pointer}: ${value} < minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${pointer}: ${value} > maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${pointer}: ${value.length} items < minItems ${schema.minItems}`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${pointer}: ${value.length} items > maxItems ${schema.maxItems}`);
    }
    if (schema.uniqueItems === true) {
      const seen = new Set(value.map((item) => JSON.stringify(item)));
      if (seen.size !== value.length) errors.push(`${pointer}: items are not unique`);
    }
    if (schema.items !== undefined) {
      value.forEach((item, index) =>
        validateNode(item, schema.items, root, `${pointer}/${index}`, errors),
      );
    }
    if (schema.contains !== undefined) {
      const hit = value.some(
        (item, index) =>
          validateNode(item, schema.contains, root, `${pointer}/${index}`, []).length === 0,
      );
      if (!hit) errors.push(`${pointer}: no item satisfies "contains"`);
    }
  }

  if (typeOf(value) === 'object') {
    for (const key of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${pointer}: missing required property ${JSON.stringify(key)}`);
      }
    }
    const declared = schema.properties ?? {};
    for (const [key, subSchema] of Object.entries(declared)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateNode(value[key], subSchema, root, `${pointer}/${key}`, errors);
      }
    }
    if (schema.additionalProperties !== undefined) {
      for (const key of Object.keys(value)) {
        if (Object.prototype.hasOwnProperty.call(declared, key)) continue;
        if (schema.additionalProperties === false) {
          errors.push(`${pointer}: unexpected additional property ${JSON.stringify(key)}`);
        } else if (typeof schema.additionalProperties === 'object') {
          validateNode(
            value[key],
            schema.additionalProperties,
            root,
            `${pointer}/${key}`,
            errors,
          );
        }
      }
    }
  }

  for (const subSchema of schema.allOf ?? []) {
    validateNode(value, subSchema, root, pointer, errors);
  }

  if (schema.anyOf !== undefined) {
    const passes = schema.anyOf.some(
      (subSchema) => validateNode(value, subSchema, root, pointer, []).length === 0,
    );
    if (!passes) errors.push(`${pointer}: matches none of the anyOf alternatives`);
  }

  if (schema.oneOf !== undefined) {
    const matched = schema.oneOf.filter(
      (subSchema) => validateNode(value, subSchema, root, pointer, []).length === 0,
    );
    if (matched.length !== 1) {
      errors.push(`${pointer}: matched ${matched.length} oneOf alternatives, expected exactly 1`);
    }
  }

  if (schema.not !== undefined) {
    if (validateNode(value, schema.not, root, pointer, []).length === 0) {
      errors.push(`${pointer}: value must NOT match the "not" schema`);
    }
  }

  return errors;
};

// Schema capabilities are independent of which optional fields or combinator branches a
// document exercises. Check every schema node first, never inside temporary branch errors.
const inspectSchema = (schema, pointer, errors) => {
  if (typeof schema === 'boolean') return;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push(`${pointer}: expected a schema object or boolean`);
    return;
  }
  for (const keyword of Object.keys(schema)) {
    if (!SUPPORTED.has(keyword)) {
      errors.push(`${pointer}: schema uses unsupported keyword ${JSON.stringify(keyword)}`);
    }
  }
  for (const keyword of ['definitions', 'properties']) {
    for (const [key, child] of Object.entries(schema[keyword] ?? {})) {
      inspectSchema(child, `${pointer}/${keyword}/${key}`, errors);
    }
  }
  for (const keyword of ['items', 'additionalProperties', 'not', 'contains']) {
    if (schema[keyword] !== undefined) inspectSchema(schema[keyword], `${pointer}/${keyword}`, errors);
  }
  for (const keyword of ['allOf', 'anyOf', 'oneOf']) {
    for (const [index, child] of (schema[keyword] ?? []).entries()) {
      inspectSchema(child, `${pointer}/${keyword}/${index}`, errors);
    }
  }
};

const validate = (value, schema) => {
  const errors = [];
  inspectSchema(schema, '#', errors);
  return errors.length ? errors : validateNode(value, schema, schema, '#', []);
};

module.exports = { validate };
