import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { secureHtml } from "./secure-export.mjs";

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
