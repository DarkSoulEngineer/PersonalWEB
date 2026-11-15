import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Load the actual build-time helpers without a runtime or test dependency.
async function moduleUrl(file, imports = {}) {
  const source = await readFile(new URL(file, import.meta.url), "utf8");
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  });
  for (const [name, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(name), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

test("production hostnames normalize to the HTTPS apex and reject malformed origins", async () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  const url = await moduleUrl("../src/lib/site.ts");
  try {
    for (const [index, origin] of [
      undefined, "http://milchiscatalin.com", "https://milchiscatalin.com",
      "https://www.milchiscatalin.com", "http://www.milchiscatalin.com",
    ].entries()) {
      if (origin === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = origin;
      const site = await import(`${url}#valid-${index}`);
      assert.equal(site.SITE_URL, "https://milchiscatalin.com");
      assert.equal(site.PERSON_ID, "https://milchiscatalin.com/#person");
      assert.equal(site.SITE_NAME, "Cătălin Milchiș");
    }
    for (const [index, origin] of [
      "https://milchiscatalin.com/path", "https://user:secret@milchiscatalin.com",
      "https://milchiscatalin.com?preview=1", "https://milchiscatalin.com/#profile",
      "ftp://milchiscatalin.com",
    ].entries()) {
      process.env.NEXT_PUBLIC_SITE_URL = origin;
      await assert.rejects(import(`${url}#invalid-${index}`), /HTTP\(S\) origin/);
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("page metadata preserves broad assessment wording and consistent social ownership", async () => {
  const siteUrl = await moduleUrl("../src/lib/site.ts");
  const seoUrl = await moduleUrl("../src/lib/seo.ts", { "./site": siteUrl });
  const { pageMetadata } = await import(seoUrl);
  const metadata = pageMetadata({
    title: "Security Assessment", description: "Scoped review and authorized testing.", path: "/services",
  });
  assert.equal(metadata.title, "Security Assessment");
  assert.equal(metadata.alternates.canonical, "/services");
  assert.equal(metadata.openGraph.title, "Security Assessment | Cătălin Milchiș");
  assert.equal(metadata.twitter.title, metadata.openGraph.title);
  assert.equal(metadata.openGraph.siteName, "Cătălin Milchiș");
  assert.equal(metadata.openGraph.type, "website");
  assert.equal(metadata.openGraph.description, metadata.description);
  assert.equal(pageMetadata({
    title: "Empty archive", description: "No articles.", path: "/articles", noindex: true,
  }).robots.index, false);
});

test("article metadata descriptions do not replace visible excerpts or technical content", async () => {
  const { getPost, getPostList } = await import(await moduleUrl("../src/lib/posts.ts"));
  const listed = getPostList();
  assert.ok(listed.length > 0);
  for (const item of listed) {
    const post = getPost(item.id);
    assert.ok(post.description.length >= 80 && post.description.length <= 180);
    assert.ok(!post.description.includes("…"));
    assert.notEqual(post.description, post.excerpt);
    const raw = await readFile(new URL(`../content/posts/${item.id}.md`, import.meta.url), "utf8");
    assert.equal(post.content, raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim());
    assert.equal(post.author, "Milchiș Cătălin-Marian");
    assert.ok(!post.content.includes("description:"));
    assert.match(post.content, /^#{1,6}\s+(?:Sources|Further reading)\s*$/m);
  }
});
