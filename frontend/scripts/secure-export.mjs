import { createHash } from "node:crypto";
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Static exports cannot use per-request nonces. Allow only the inline scripts
// actually emitted by the build, rather than allowing arbitrary inline JavaScript.
export function secureHtml(html) {
  if (!html.includes("<head>")) throw new Error("Exported HTML is missing <head>");
  if (/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    throw new Error("Exported HTML already contains a CSP");
  }

  const hashes = new Set();
  for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!/\bsrc\s*=/i.test(attributes)) {
      hashes.add(`'sha256-${createHash("sha256").update(content).digest("base64")}'`);
    }
  }

  const policy = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(" ")}`.trim(),
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self'",
    "media-src https://*.somafm.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");

  return html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`);
}

async function secureDirectory(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      count += await secureDirectory(file);
    } else if (entry.name.endsWith(".html")) {
      await writeFile(file, secureHtml(await readFile(file, "utf8")));
      count++;
    }
  }
  return count;
}

// Next 16.4 on Windows leaves native separators in exported RSC segment names.
// The browser requests dotted names on every platform. Keep the original files
// and add only the missing aliases; remove when upstream normalizes separators.
export async function normalizeSegmentFiles(directory, segmentPrefix = "") {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    if (entry.isDirectory()) {
      const prefix = segmentPrefix
        ? `${segmentPrefix}${entry.name}.`
        : entry.name.startsWith("__next.") ? `${source}.` : "";
      count += await normalizeSegmentFiles(source, prefix);
    } else if (segmentPrefix && entry.name.endsWith(".txt")) {
      const destination = `${segmentPrefix}${entry.name}`;
      const existing = await readFile(destination).catch(error => {
        if (error.code !== "ENOENT") throw error;
        return null;
      });
      if (existing) {
        if (!existing.equals(await readFile(source))) throw new Error(`Conflicting RSC segment: ${destination}`);
      } else {
        await copyFile(source, destination);
        count++;
      }
    }
  }
  return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const aliases = await normalizeSegmentFiles(resolve("out"));
  if (aliases) console.log(`Normalized ${aliases} static RSC segment filenames.`);
  const count = await secureDirectory(resolve("out"));
  if (count === 0) throw new Error("No exported HTML pages found");
  console.log(`Applied hash-based script policies to ${count} exported HTML pages.`);
}
