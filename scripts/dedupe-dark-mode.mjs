import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function utilityKey(token) {
  if (!token.startsWith('dark:')) return null;
  const stripped = token.slice(5);
  const match = stripped.match(/^((?:hover:|focus:|active:)?)([a-z]+(?:-\[[^\]]+\])?)/);
  if (!match) return token;
  return `dark:${match[1]}${match[2]}`;
}

function dedupeClassList(classList) {
  const normal = [];
  const darkByKey = new Map();

  for (const token of classList.split(/\s+/).filter(Boolean)) {
    const key = utilityKey(token);
    if (key) darkByKey.set(key, token);
    else normal.push(token);
  }

  return [...normal, ...darkByKey.values()].join(' ');
}

function processContent(content) {
  return content.replace(/className="([^"]*)"/g, (match, classes) => {
    const cleaned = dedupeClassList(classes);
    return cleaned === classes ? match : `className="${cleaned}"`;
  }).replace(/className=\{cn\(([\s\S]*?)\)\}/g, (match) => match);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.jsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = processContent(original);
  if (updated !== original) fs.writeFileSync(file, updated);
}

console.log('Duplicate dark utilities deduped.');
