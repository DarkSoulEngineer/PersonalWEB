import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { normalizeSegmentFiles, secureHtml } from "./secure-export.mjs";

test("allows exact build-generated inline scripts without unsafe-inline JavaScript", () => {
  const script = 'document.documentElement.dataset.theme = "light";';
  const hash = createHash("sha256").update(script).digest("base64");
  const html = `<html><head><script>${script}</script></head><body></body></html>`;
  const result = secureHtml(html);
  assert.ok(result.includes(`script-src 'self' 'sha256-${hash}'`));
  assert.ok(result.indexOf('http-equiv="Content-Security-Policy"') < result.indexOf("<script>"));
  assert.match(result, /script-src-attr 'none'/);
  assert.doesNotMatch(result, /script-src[^;]*'unsafe-inline'/);
  assert.ok(result.includes(html.slice(html.indexOf("<script>"))));
});

test("deduplicates inline hashes and permits same-origin external scripts", () => {
  const result = secureHtml('<head><script src="/app.js"></script><script>start()</script><script>start()</script></head>');
  assert.equal((result.match(/sha256-/g) ?? []).length, 1);
  assert.match(result, /script-src 'self'/);
});

test("fails closed on malformed HTML or duplicate policies", () => {
  assert.throws(() => secureHtml("<body></body>"), /missing/);
  assert.throws(() => secureHtml(secureHtml("<head></head>")), /already contains/);
});

test("restricts forms, plugins, network access and media", () => {
  const result = secureHtml("<head></head>");
  for (const directive of [
    "form-action 'none'", "object-src 'none'", "connect-src 'self'",
    "base-uri 'self'", "media-src https://*.somafm.com",
  ]) {
    assert.ok(result.includes(directive));
  }
});

test("normalizes nested static RSC segments without changing originals or valid exports", async () => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-export-"));
  try {
    const nested = join(root, "projects", "__next.projects", "$d$slug");
    await mkdir(nested, { recursive: true });
    await writeFile(join(nested, "__PAGE__.txt"), "segment payload");
    await writeFile(join(root, "__next._tree.txt"), "valid payload");
    assert.equal(await normalizeSegmentFiles(root), 1);
    assert.equal(await readFile(join(root, "projects", "__next.projects.$d$slug.__PAGE__.txt"), "utf8"), "segment payload");
    assert.equal(await readFile(join(nested, "__PAGE__.txt"), "utf8"), "segment payload");
    assert.equal(await readFile(join(root, "__next._tree.txt"), "utf8"), "valid payload");
    assert.equal(await normalizeSegmentFiles(root), 0);
  } finally {
    await rm(root, { recursive: true });
  }
});

test("does not overwrite conflicting segment aliases", async () => {
  const root = await mkdtemp(join(tmpdir(), "portfolio-export-"));
  try {
    await mkdir(join(root, "__next.projects"));
    await writeFile(join(root, "__next.projects", "__PAGE__.txt"), "new");
    await writeFile(join(root, "__next.projects.__PAGE__.txt"), "existing");
    await assert.rejects(normalizeSegmentFiles(root), /Conflicting RSC segment/);
    assert.equal(await readFile(join(root, "__next.projects.__PAGE__.txt"), "utf8"), "existing");
  } finally {
    await rm(root, { recursive: true });
  }
});
