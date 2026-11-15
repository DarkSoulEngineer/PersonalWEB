import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Exercise the real TSX renderers without introducing a new test dependency.
async function loadComponent(relativePath, imports) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  });
  for (const name of ["react/jsx-runtime", ...imports]) {
    outputText = outputText.replaceAll(JSON.stringify(name), JSON.stringify(import.meta.resolve(name)));
  }
  return (await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)).default;
}

const JsonLd = await loadComponent("../src/components/ui/JsonLd.tsx", []);
const Markdown = await loadComponent("../src/components/ui/Markdown.tsx", ["react-markdown", "remark-gfm"]);

test("JSON-LD cannot break out of its script element", () => {
  const data = {
    "@type": "Person",
    name: '</script><script>alert("injected")</script><img src=x onerror=alert(1)>',
  };
  const html = renderToStaticMarkup(JsonLd({ data }));
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.equal((html.match(/<\/script>/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<img\b/);
  assert.deepEqual(JSON.parse(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]), data);
});

test("Markdown does not execute raw HTML or dangerous link protocols", () => {
  const content = [
    '<script>alert("injected")</script>',
    '<img src="x" onerror="alert(1)">',
    "[script](javascript:alert%281%29)",
    "[legacy](vbscript:msgbox%281%29)",
    "[data](data:text/html;base64,PHNjcmlwdD4=)",
    "![unsafe image](javascript:alert%281%29)",
  ].join("\n\n");
  const html = renderToStaticMarkup(Markdown({ content }));
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<[^>]+\bonerror\s*=/i);
  assert.doesNotMatch(html, /\b(?:href|src)="(?:javascript:|vbscript:|data:text\/html)/i);
  // A rejected image source must not become an empty src, which would refetch the page.
  assert.doesNotMatch(html, /<img\b/);
  assert.doesNotMatch(html, /\bsrc=""/);
});

test("external Markdown links isolate the opener and keep relative links usable", () => {
  const html = renderToStaticMarkup(Markdown({
    content: "[external](https://example.com) and [local](/projects/modbus)",
  }));
  assert.match(html, /href="https:\/\/example\.com"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(html, /href="\/projects\/modbus"/);
});

test("safe Markdown images still render", () => {
  const html = renderToStaticMarkup(Markdown({
    content: "![diagram](/media/diagram.png)",
  }));
  assert.match(html, /<img\b[^>]*src="\/media\/diagram\.png"[^>]*alt="diagram"/);
});

test("Bash examples are highlighted without executing markup or changing commands", () => {
  const command = 'modbus read 127.0.0.1 --slave 1 "<script>alert(1)</script>"';
  const html = renderToStaticMarkup(Markdown({ content: `\`\`\`bash\n${command}\n\`\`\`` }));
  assert.match(html, /class="syntax-option">--slave<\/span>/);
  assert.match(html, /class="syntax-string"/);
  assert.match(html, /tabindex="0" role="region" aria-label="Code example"/);
  assert.doesNotMatch(html, /<script\b/);
  assert.ok(html.includes("&lt;script&gt;"));
});

test("Markdown keeps unsupported code languages and inline code as plain text", () => {
  const html = renderToStaticMarkup(Markdown({
    content: "Use `--slave`.\n\n```python\nprint('--slave')\n```",
  }));
  assert.doesNotMatch(html, /syntax-option/);
  assert.match(html, /class="language-python"/);
  assert.match(html, /<code>--slave<\/code>/);
});
