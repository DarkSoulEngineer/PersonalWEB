import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const out = resolve("out");
const expectedOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://milchiscatalin.com").origin;
assert.ok(expectedOrigin.startsWith("https://"), "Release canonical URLs must use HTTPS");
assert.ok(!new URL(expectedOrigin).hostname.endsWith(".vercel.app"), "Use the production custom domain, not a Vercel preview alias");
assert.ok(!["localhost", "127.0.0.1", "[::1]"].includes(new URL(expectedOrigin).hostname), "Do not publish localhost canonical URLs");

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function schemas(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attributes(match[1]).type === "application/ld+json")
    .flatMap((match) => {
      const data = JSON.parse(match[2]);
      return data["@graph"] ?? [data];
    });
}

const robots = await readFile(resolve(out, "robots.txt"), "utf8");
assert.match(robots, /User-Agent:\s*\*/i);
assert.match(robots, /^Allow:\s*\/\s*$/im);
assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/im);
assert.ok(robots.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`), "robots.txt must advertise the production sitemap");

const sitemap = await readFile(resolve(out, "sitemap.xml"), "utf8");
assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
const paths = new Set(urls.map((url) => url.pathname));
assert.equal(paths.size, urls.length, "Sitemap URLs must be unique");
for (const path of [
  "/", "/cv", "/projects", "/projects/cc1101-driver", "/projects/modbus", "/projects/rtsp-to-http",
  "/services", "/articles",
  "/posts/cc1101-packet-mode-and-raw-capture",
  "/posts/what-is-software-defined-radio",
  "/posts/sub-ghz-radio-cc1101-basics",
  "/posts/modbus-basics-local-lab",
]) {
  assert.ok(paths.has(path), `Missing sitemap entry: ${path}`);
}

for (const url of urls) {
  assert.equal(url.origin, expectedOrigin, `Unexpected sitemap origin: ${url}`);
  const file = url.pathname === "/" ? "index.html" : `${url.pathname.slice(1)}.html`;
  const html = await readFile(resolve(out, file), "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  assert.ok(title?.trim(), `${file}: missing title`);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${file}: expected one H1`);
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  assert.ok(meta.some((item) => item.name === "description" && item.content?.trim()), `${file}: missing description`);
  for (const directive of meta.filter((item) => ["robots", "googlebot"].includes(item.name))) {
    assert.doesNotMatch(directive.content ?? "", /\b(noindex|none)\b/i, `${file}: indexable URL has noindex`);
  }
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attributes(match[0])).filter((item) => item.rel === "canonical");
  assert.equal(canonicals.length, 1, `${file}: expected one canonical`);
  assert.equal(new URL(canonicals[0].href).href, url.href, `${file}: wrong canonical`);
  assert.ok(schemas(html).some((schema) => schema["@type"] === "Person"), `${file}: missing Person graph`);
  if (url.pathname.startsWith("/projects/")) {
    const graph = schemas(html);
    assert.ok(graph.some((schema) => schema["@type"] === "TechArticle"), `${file}: missing case-study markup`);
    assert.ok(graph.some((schema) => schema["@type"] === "SoftwareSourceCode"), `${file}: missing source-code markup`);
    assert.ok(html.includes('class="architecture__steps"'), `${file}: missing architecture diagram`);
  }
  if (url.pathname.startsWith("/posts/")) {
    const article = schemas(html).find((schema) => schema["@type"] === "BlogPosting");
    assert.ok(article, `${file}: missing article markup`);
    assert.equal(article.url, url.href, `${file}: wrong article URL`);
    assert.ok(article.datePublished, `${file}: missing publication date`);
  }
  if (url.pathname === "/services") {
    const service = schemas(html).find((schema) => schema["@type"] === "Service");
    assert.ok(service, `${file}: missing service markup`);
    assert.equal(service.url, url.href, `${file}: wrong service URL`);
    const cv = JSON.parse(await readFile(resolve("data/cv.json"), "utf8"));
    assert.ok(html.includes(`mailto:${cv.contact.email}?subject=`), `${file}: missing email contact`);
    const profile = JSON.parse(await readFile(resolve("data/profile.json"), "utf8"));
    assert.ok(html.includes(`href="${profile.links.linkedin}"`), `${file}: missing LinkedIn contact`);
  }
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attributes(match[0]).href;
    if (!href) continue;
    const link = new URL(href, url);
    assert.ok(!["localhost", "127.0.0.1", "[::1]"].includes(link.hostname),
      `${file}: public link points at localhost`);
    if (link.origin !== expectedOrigin) continue;
    const target = link.pathname === "/" ? "index.html" : `${link.pathname.slice(1)}.html`;
    await readFile(resolve(out, target), "utf8").catch(() => {
      assert.fail(`${file}: internal route is not exported: ${link.pathname}`);
    });
  }
}

const home = await readFile(resolve(out, "index.html"), "utf8");
assert.ok(home.includes('href="/posts/what-is-software-defined-radio"'), "Homepage must link to the latest article");
assert.ok(home.includes('href="/articles"'), "Homepage must link to the article archive");
assert.ok(home.includes('href="/services"'), "Navigation must link to services");

const articles = await readFile(resolve(out, "articles.html"), "utf8");
for (const slug of ["what-is-software-defined-radio", "sub-ghz-radio-cc1101-basics", "modbus-basics-local-lab"]) {
  assert.ok(articles.includes(`href="/posts/${slug}"`), `Articles page must link to ${slug}`);
}
assert.match(home, /<title>[^<]*Penetration Tester[^<]*Brașov[^<]*Romania/);
const h1 = home.match(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i);
assert.ok(h1 && !h1[1].includes("sr-only"), "Homepage H1 must be visible");
assert.match(h1[2], /Penetration Tester.*Security Engineer.*Brașov/);
const head = home.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
const person = schemas(head).find((schema) => schema["@type"] === "Person");
assert.ok(person, "Person JSON-LD must be present in the homepage head");
assert.equal(person.address?.addressLocality, "Brașov");
const profile = JSON.parse(await readFile(resolve("data/profile.json"), "utf8"));
assert.ok(person.sameAs.includes(profile.links.github));
assert.ok(person.sameAs.includes(profile.links.linkedin));

console.log(`SEO checks passed: ${urls.length} indexable URLs, production canonicals, robots, sitemap, H1s and structured data.`);
