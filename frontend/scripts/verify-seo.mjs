import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const out = resolve("out");
const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://milchiscatalin.com");
const expectedOrigin = ["milchiscatalin.com", "www.milchiscatalin.com"].includes(configuredUrl.hostname)
  ? "https://milchiscatalin.com"
  : configuredUrl.origin;
const publicName = "Cătălin Milchiș";
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
const titles = new Set();
const descriptions = new Set();
assert.equal(paths.size, urls.length, "Sitemap URLs must be unique");
for (const path of [
  "/", "/cv", "/projects", "/projects/cc1101-driver", "/projects/modbus", "/projects/rtsp-to-http",
  "/services", "/articles",
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
  assert.doesNotMatch(title, /(?:\||[-–:])\s*$/, `${file}: incomplete title`);
  assert.ok(!titles.has(title), `${file}: duplicate title`);
  assert.equal(title.split(publicName).length, 2, `${file}: expected public name exactly once in title`);
  titles.add(title);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${file}: expected one H1`);
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  for (const property of ["og:title", "og:description", "og:site_name", "og:image", "og:url"]) {
    assert.ok(meta.some((item) => item.property === property && item.content?.trim()), `${file}: missing ${property}`);
  }
  assert.equal(new URL(meta.find((item) => item.property === "og:url").content).href, url.href, `${file}: wrong Open Graph URL`);
  assert.ok(meta.some((item) => item.name === "twitter:title" && item.content?.trim()), `${file}: missing social title`);
  assert.ok(meta.some((item) => item.name === "description" && item.content?.trim()), `${file}: missing description`);
  const description = meta.find((item) => item.name === "description").content;
  assert.ok(!descriptions.has(description), `${file}: duplicate description`);
  descriptions.add(description);
  assert.equal(meta.find((item) => item.property === "og:title").content, title, `${file}: inconsistent Open Graph title`);
  assert.equal(meta.find((item) => item.name === "twitter:title").content, title, `${file}: inconsistent social title`);
  assert.equal(meta.find((item) => item.property === "og:description").content, description, `${file}: inconsistent Open Graph description`);
  assert.equal(meta.find((item) => item.name === "twitter:description")?.content, description, `${file}: inconsistent social description`);
  assert.equal(meta.find((item) => item.property === "og:site_name").content, publicName, `${file}: inconsistent ownership`);
  for (const directive of meta.filter((item) => ["robots", "googlebot"].includes(item.name))) {
    assert.doesNotMatch(directive.content ?? "", /\b(noindex|none)\b/i, `${file}: indexable URL has noindex`);
  }
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => attributes(match[0])).filter((item) => item.rel === "canonical");
  assert.equal(canonicals.length, 1, `${file}: expected one canonical`);
  assert.equal(new URL(canonicals[0].href).href, url.href, `${file}: wrong canonical`);
  assert.ok(schemas(html).some((schema) => schema["@type"] === "Person"), `${file}: missing Person graph`);
  assert.ok(schemas(html).find((schema) => schema["@type"] === "Person")?.name?.trim(), `${file}: missing person name`);
  const graph = schemas(html);
  const person = graph.find((schema) => schema["@type"] === "Person");
  assert.equal(person.name, publicName, `${file}: inconsistent person name`);
  assert.equal(person["@id"], `${expectedOrigin}/#person`, `${file}: unstable person identifier`);
  assert.ok(person.alternateName.includes("DarkSoulEngineer"), `${file}: missing technical alias`);
  assert.ok(!graph.some((schema) => ["Service", "LocalBusiness", "Offer"].includes(schema["@type"])),
    `${file}: personal portfolio must not imply commercial business status`);
  function checkReferences(value) {
    if (!value || typeof value !== "object") return;
    if (value["@id"] && Object.keys(value).length === 1) {
      assert.ok(graph.some((schema) => schema["@id"] === value["@id"]), `${file}: unresolved entity ${value["@id"]}`);
    }
    for (const child of Object.values(value)) checkReferences(child);
  }
  graph.forEach(checkReferences);
  for (const match of html.matchAll(/<(?:img|script|link)\b[^>]*>/gi)) {
    const attr = attributes(match[0]);
    if (match[0].startsWith("<img")) assert.ok("alt" in attr, `${file}: image missing alternative text`);
    const src = attr.src ?? (["stylesheet", "icon", "apple-touch-icon", "manifest"].includes(attr.rel) ? attr.href : undefined);
    if (!src?.startsWith("/") || src.startsWith("//")) continue;
    await readFile(resolve(out, new URL(src, url).pathname.slice(1))).catch(() => {
      assert.fail(`${file}: missing local asset: ${src}`);
    });
  }
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
    assert.equal(article.description, description.replaceAll("&amp;", "&").replaceAll("&#x27;", "'"), `${file}: inconsistent article description`);
    assert.equal(article.author["@id"], person["@id"], `${file}: inconsistent authorship`);
    for (const date of [article.datePublished, article.dateModified]) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${file}: invalid editorial date`);
      assert.ok(!Number.isNaN(Date.parse(date)), `${file}: invalid editorial date`);
    }
    assert.ok(html.includes(`dateTime="${article.datePublished}"`), `${file}: missing semantic publication date`);
  }
  if (url.pathname === "/services") {
    const assessment = graph.find((schema) => schema["@type"] === "WebPage");
    assert.ok(assessment, `${file}: missing assessment methodology page markup`);
    assert.equal(assessment.url, url.href, `${file}: wrong assessment URL`);
    assert.equal(assessment.author["@id"], person["@id"], `${file}: wrong assessment author`);
    assert.ok(html.includes("Security Assessment"), `${file}: missing assessment heading`);
    assert.doesNotMatch(html, /penetration testing services/i, `${file}: stale service wording`);
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
    const targetHtml = await readFile(resolve(out, target), "utf8").catch(() => {
      assert.fail(`${file}: internal route is not exported: ${link.pathname}`);
    });
    if (link.hash) {
      const id = decodeURIComponent(link.hash.slice(1));
      assert.ok(targetHtml.includes(`id="${id}"`), `${file}: missing anchor: ${link.pathname}${link.hash}`);
    }
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
assert.ok(home.includes(`<title>Penetration Tester &amp; Security Engineer | ${publicName}</title>`), "Homepage must identify the role and author");
const h1 = home.match(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i);
assert.ok(h1 && !h1[1].includes("sr-only"), "Homepage H1 must be visible");
assert.match(h1[2], /Penetration Tester.*Security Engineer/);
assert.ok(home.includes("Brașov"), "Homepage must retain location context");
assert.ok(home.includes("Milchis Catalin-Marian"), "Homepage must show the owner's name");
for (const name of ["CC1101_DRIVER", "modbus", "XDR_C2"]) {
  assert.ok(home.includes(name), `Homepage must feature ${name}`);
}
const head = home.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
const person = schemas(head).find((schema) => schema["@type"] === "Person");
assert.ok(person, "Person JSON-LD must be present in the homepage head");
assert.equal(person.address?.addressLocality, "Brașov");
const profile = JSON.parse(await readFile(resolve("data/profile.json"), "utf8"));
assert.ok(person.sameAs.includes(profile.links.github));
assert.ok(person.sameAs.includes(profile.links.linkedin));
assert.ok(person.alternateName.includes(profile.name), "Preserve the established full name as an identity alias");
for (const path of ["/404", "/_not-found", "/posts/cc1101-packet-mode-and-raw-capture"]) {
  assert.ok(!paths.has(path), `Utility or redirected URL must not be in the sitemap: ${path}`);
}
for (const file of ["404.html", "_not-found.html"]) {
  const html = await readFile(resolve(out, file), "utf8");
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  assert.ok(meta.some((item) => item.name === "robots" && /\bnoindex\b/.test(item.content)), `${file}: utility page must be noindex`);
  assert.doesNotMatch(html, /<link\b[^>]*rel="canonical"/i, `${file}: error page must not canonicalize to the homepage`);
}

for (const configPath of ["../vercel.json", "vercel.json"]) {
  const config = JSON.parse(await readFile(resolve(configPath), "utf8"));
  const [homepage, nestedPaths] = ["/", "/:path*"].map((path) =>
    config.redirects.findIndex((rule) =>
      rule.source === path && rule.permanent === true
      && rule.destination === `https://milchiscatalin.com${path}`
      && rule.has?.length === 1
      && rule.has[0].type === "host" && rule.has[0].value === "www\\.milchiscatalin\\.com"
    )
  );
  assert.ok(homepage >= 0, `${configPath}: missing explicit www homepage redirect`);
  assert.ok(nestedPaths > homepage, `${configPath}: expected a www path redirect after the homepage redirect`);
}

console.log(`SEO checks passed: ${urls.length} indexable URLs, unique titles, social metadata, canonicals, assets, internal anchors, redirects and structured data.`);
