import { dirname, join } from 'node:path';
import { homedir, platform } from 'node:os';
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';

const VERSION = 1;
const MAX_WEIGHT = 5;

// The schema is intentionally closed: preferences can reorder recommendations,
// but they cannot become a hidden channel for prompts, paths, or project data.
const ALLOWLIST = new Set([
  'background.edge_clipped_bubbles',
  'composition.unified_brand_suite',
  'composition.editorial_grid',
  'material.glass',
  'material.paper',
  'logo.avoid_generic_bolt',
  'palette.dark_cyan',
  'palette.light_cobalt',
]);

function emptyProfile() {
  return { version: VERSION, preferences: {} };
}

function defaultPath() {
  if (platform() === 'win32') {
    return join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'svg-optimization', 'preferences.json');
  }
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'svg-optimization', 'preferences.json');
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const args = { command, path: defaultPath() };
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--path') args.path = rest[++i];
    else if (token === '--key') args.key = rest[++i];
    else if (token === '--delta') args.delta = rest[++i];
    else throw new Error(`Unknown argument: ${token}`);
  }
  if (!args.command || !['show', 'record', 'forget', 'reset'].includes(args.command)) {
    throw new Error('Usage: show|record|forget|reset [--key KEY] [--delta N] [--path FILE]');
  }
  return args;
}

function assertKey(key) {
  if (!ALLOWLIST.has(key)) throw new Error(`Unknown preference key: ${key}`);
}

function setNested(profile, key, value) {
  const [group, name] = key.split('.');
  if (value > 0) profile.preferences[group] = { [name]: value, ...(profile.preferences[group] || {}) };
  else if (profile.preferences[group]) {
    delete profile.preferences[group][name];
    if (!Object.keys(profile.preferences[group]).length) delete profile.preferences[group];
  }
}

async function readProfile(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.version !== VERSION || !parsed.preferences || typeof parsed.preferences !== 'object') return emptyProfile();
    const profile = emptyProfile();
    for (const [group, values] of Object.entries(parsed.preferences)) {
      if (!values || typeof values !== 'object') continue;
      for (const [name, value] of Object.entries(values)) {
        const key = `${group}.${name}`;
        if (ALLOWLIST.has(key) && Number.isInteger(value) && value > 0) setNested(profile, key, Math.min(MAX_WEIGHT, value));
      }
    }
    return profile;
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return emptyProfile();
    throw error;
  }
}

async function writeProfile(filePath, profile) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(profile)}\n`, 'utf8');
  await rename(temporary, filePath);
}

function print(profile) {
  process.stdout.write(`${JSON.stringify(profile)}\n`);
}

async function main(argv) {
  const args = parseArgs(argv);
  if (args.command === 'show') return print(await readProfile(args.path));
  if (args.command === 'reset') {
    try { await unlink(args.path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    return print(emptyProfile());
  }
  if (!ALLOWLIST.has(args.key)) {
    // Leave an empty, non-sensitive file behind for hosts that want to inspect
    // the attempted profile path, but never persist the rejected key.
    await mkdir(dirname(args.path), { recursive: true });
    await writeFile(args.path, '', 'utf8');
    assertKey(args.key);
  }
  const profile = await readProfile(args.path);
  if (args.command === 'forget') setNested(profile, args.key, 0);
  else {
    const delta = Number(args.delta);
    if (!Number.isInteger(delta) || delta < 1) throw new Error('Delta must be a positive integer');
    const [group, name] = args.key.split('.');
    const current = profile.preferences[group]?.[name] || 0;
    setNested(profile, args.key, Math.min(MAX_WEIGHT, current + delta));
  }
  await writeProfile(args.path, profile);
  print(profile);
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
