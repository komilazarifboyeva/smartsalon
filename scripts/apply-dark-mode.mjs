import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const pairs = [
  ['text-slate-900', 'dark:text-slate-100'],
  ['text-slate-800', 'dark:text-slate-200'],
  ['text-slate-700', 'dark:text-slate-300'],
  ['text-slate-600', 'dark:text-slate-400'],
  ['text-slate-500', 'dark:text-slate-400'],
  ['text-slate-400', 'dark:text-slate-500'],
  ['text-slate-300', 'dark:text-slate-600'],
  ['bg-slate-50', 'dark:bg-slate-950'],
  ['bg-slate-100', 'dark:bg-slate-800'],
  ['border-slate-100', 'dark:border-slate-800'],
  ['border-slate-200', 'dark:border-slate-700'],
  ['hover:bg-slate-50', 'dark:hover:bg-slate-800'],
  ['hover:bg-slate-100', 'dark:hover:bg-slate-800'],
  ['hover:text-slate-900', 'dark:hover:text-slate-100'],
  ['hover:text-slate-800', 'dark:hover:text-slate-200'],
  ['hover:text-slate-700', 'dark:hover:text-slate-300'],
  ['from-brand-50', 'dark:from-slate-950'],
  ['via-fuchsia-50', 'dark:via-slate-900'],
  ['via-white', 'dark:via-slate-950'],
  ['to-white', 'dark:to-slate-900'],
  ['to-slate-50', 'dark:to-slate-950'],
  ['bg-brand-50', 'dark:bg-brand-950/40'],
  ['border-brand-100', 'dark:border-brand-900/50'],
  ['bg-emerald-50', 'dark:bg-emerald-950/40'],
  ['text-emerald-700', 'dark:text-emerald-400'],
  ['border-emerald-200', 'dark:border-emerald-800'],
  ['bg-red-50', 'dark:bg-red-950/40'],
  ['border-red-200', 'dark:border-red-800'],
  ['text-red-700', 'dark:text-red-400'],
  ['text-red-600', 'dark:text-red-400'],
  ['bg-amber-50', 'dark:bg-amber-950/40'],
  ['border-amber-200', 'dark:border-amber-800'],
  ['text-amber-700', 'dark:text-amber-400'],
  ['text-amber-800', 'dark:text-amber-400'],
  ['bg-blue-50', 'dark:bg-blue-950/40'],
  ['border-blue-200', 'dark:border-blue-800'],
  ['text-blue-700', 'dark:text-blue-400'],
];

const skipFiles = new Set([
  path.normalize('styles/index.css'),
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.jsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

function addDarkVariants(content) {
  let next = content;
  for (const [light, dark] of pairs) {
    const escaped = light.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'g');
    next = next.replace(regex, (match, offset, whole) => {
      const after = whole.slice(offset + match.length, offset + match.length + dark.length + 2);
      if (after.startsWith(` ${dark}`) || after.startsWith(`  ${dark}`)) return match;
      return `${match} ${dark}`;
    });
  }

  next = next.replace(/\bbg-white(?![\w-])/g, (match, offset, whole) => {
    const after = whole.slice(offset + match.length, offset + match.length + 20);
    if (after.startsWith(' dark:bg-') || after.startsWith('/')) return match;
    return `${match} dark:bg-slate-900`;
  });

  return next;
}

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  if (skipFiles.has(rel.replace(/\\/g, '/'))) continue;
  const original = fs.readFileSync(file, 'utf8');
  const updated = addDarkVariants(original);
  if (updated !== original) fs.writeFileSync(file, updated);
}

console.log('Dark mode classes applied.');
