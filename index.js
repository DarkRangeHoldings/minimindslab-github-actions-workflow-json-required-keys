import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input: payload must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  throw new Error('Invalid input: payload must be an object');
}

if (!Object.prototype.hasOwnProperty.call(parsed, 'value')) {
  throw new Error('Invalid input: payload.value is required');
}
if (!Object.prototype.hasOwnProperty.call(parsed, 'required')) {
  throw new Error('Invalid input: payload.required is required');
}

const value = parsed.value;
const required = parsed.required;

if (value === null || typeof value !== 'object' || Array.isArray(value)) {
  throw new Error('Invalid input: value must be a plain object');
}

if (!Array.isArray(required)) {
  throw new Error('Invalid input: required must be an array');
}

const seen = Object.create(null);
for (let i = 0; i < required.length; i += 1) {
  const k = required[i];
  if (typeof k !== 'string' || k.length === 0) {
    throw new Error('Invalid input: required must contain non-empty strings');
  }
  if (Object.prototype.hasOwnProperty.call(seen, k)) {
    throw new Error('Invalid input: required keys must be unique');
  }
  seen[k] = true;
}

const present = [];
const missing = [];

for (let i = 0; i < required.length; i += 1) {
  const k = required[i];
  if (Object.prototype.hasOwnProperty.call(value, k)) {
    present.push(k);
  } else {
    missing.push(k);
  }
}

present.sort();
missing.sort();

const result = { missing, ok: missing.length === 0, present };
appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);