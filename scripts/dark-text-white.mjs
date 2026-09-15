import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const keepDarkText = /dark:text-(brand|emerald|red|amber|blue|white)/;

function normalizeDarkText(content) {
  let next = content
    .replace(/dark:text-slate-\d+/g, 'dark:text-white')
    .replace(/dark:hover:text-slate-\d+/g, 'dark:hover:text-white')
    .replace(/dark:placeholder:text-slate-\d+/g, 'dark:placeholder:text-white/60');

  next = next.replace(/className="([^"]*)"/g, (match, classes) => {
    if (!/\btext-slate-\d+\b/.test(classes)) return match;
    if (keepDarkText.test(classes) || /\bdark:text-white\b/.test(classes)) return match;
    return `className="${classes} dark:text-white"`;
  });

  return next.replace(/\bdark:text-white dark:text-white\b/g, 'dark:text-white');
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = normalizeDarkText(original);
  if (updated !== original) fs.writeFileSync(file, updated);
}

console.log('Dark mode text colors set to white.');
