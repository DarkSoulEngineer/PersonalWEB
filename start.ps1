<#
.SYNOPSIS
    Starts the Milchis personal site (Next.js static export).

.DESCRIPTION
    The site is a fully static Next.js app (output: "export"). Production
    therefore has no Node server: `next build` emits plain files into
    frontend/out/, which are served by any static file host.

    By default this script:
      1. installs npm dependencies if node_modules/ is missing or older than
         package.json / package-lock.json
      2. runs `next build` if frontend/out/ is missing or older than any source
         file (src/, content/, data/, public/ or the config files)
      3. serves frontend/out/ on http://localhost:<Port> using a small,
         dependency-free Node static file server

    Use -Dev to instead run the Next.js development server (`next dev`),
    which supports hot reload while authoring.

.PARAMETER Port
    TCP port to listen on. Default: 3000.

.PARAMETER Dev
    Run the Next.js dev server (`npm run dev`) instead of serving the build.

.PARAMETER Build
    Force a fresh `next build` before serving the static export.

.PARAMETER Install
    Force `npm install` even if node_modules/ already exists.

.PARAMETER Open
    Open the site in the default browser once the command starts.

.EXAMPLE
    .\start.ps1
    Build (if needed) and serve the static site on http://localhost:3000.

.EXAMPLE
    .\start.ps1 -Dev -Port 4000
    Run the dev server on http://localhost:4000 with hot reload.

.EXAMPLE
    .\start.ps1 -Build
    Rebuild the static export, then serve it.
#>
[CmdletBinding()]
param(
    [int]$Port = 3000,
    [switch]$Dev,
    [switch]$Build,
    [switch]$Install,
    [switch]$Open
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ($Port -lt 1 -or $Port -gt 65535) {
    throw "Invalid -Port '$Port'. Expected a value between 1 and 65535."
}

$repoRoot = $PSScriptRoot
$frontend = Join-Path $repoRoot 'frontend'

if (-not (Test-Path (Join-Path $frontend 'package.json'))) {
    throw "Could not find '$frontend\package.json'. Run this script from the repository root."
}

$node = Get-Command node -ErrorAction SilentlyContinue
$npm  = Get-Command npm  -ErrorAction SilentlyContinue
if (-not $node) { throw 'Node.js is required but was not found on PATH.' }
if (-not $npm)  { throw 'npm is required but was not found on PATH.' }

$nodeVersion = (& node --version).TrimStart('v')
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 20) {
    throw "Node.js 20+ is required (found v$nodeVersion). See README.md."
}

Push-Location $frontend
try {
    $installMarker = Join-Path $frontend 'node_modules\.package-lock.json'
    $manifests = @('package.json', 'package-lock.json') |
        ForEach-Object { Join-Path $frontend $_ } |
        Where-Object { Test-Path $_ }
    $needsInstall = $Install -or -not (Test-Path $installMarker) -or
        -not (Test-Path (Join-Path $frontend 'package-lock.json'))
    if (-not $needsInstall) {
        $installedAt = (Get-Item $installMarker).LastWriteTimeUtc
        $needsInstall = [bool]($manifests | Where-Object { (Get-Item $_).LastWriteTimeUtc -gt $installedAt })
    }
    if ($needsInstall) {
        Write-Host 'Installing dependencies (npm install)...' -ForegroundColor Cyan
        & npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE." }
        if (Test-Path $installMarker) {
            (Get-Item $installMarker).LastWriteTimeUtc = [DateTime]::UtcNow
        }
    }

    if ($Dev) {
        Write-Host "Starting Next.js dev server at http://localhost:$Port ..." -ForegroundColor Cyan
        if ($Open) { Start-Process "http://localhost:$Port" }
        & npm run dev -- --port $Port
        exit $LASTEXITCODE
    }

    $outDir = Join-Path $frontend 'out'
    $index  = Join-Path $outDir 'index.html'

    $needsBuild = $Build -or $needsInstall -or -not (Test-Path $index)
    if (-not $needsBuild) {
        $builtAt = (Get-Item $index).LastWriteTimeUtc
        $sources = @(
            @('src', 'content', 'data', 'public', 'scripts') |
                ForEach-Object { Join-Path $frontend $_ } |
                Where-Object { Test-Path $_ } |
                ForEach-Object { Get-ChildItem $_ -Recurse -File }
        ) + @(
            @('next.config.ts', 'package.json', 'package-lock.json', 'tsconfig.json', 'vercel.json') |
                ForEach-Object { Join-Path $frontend $_ } |
                Where-Object { Test-Path $_ } |
                ForEach-Object { Get-Item $_ }
        )
        $needsBuild = [bool]($sources | Where-Object { $_.LastWriteTimeUtc -gt $builtAt } | Select-Object -First 1)
    }
    if ($needsBuild) {
        Write-Host 'Building static export (npm run build)...' -ForegroundColor Cyan
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE." }
    }

    if (-not (Test-Path $index)) {
        throw "Static export not found at '$outDir'. Run the script with -Build."
    }

    $serverJs = @'
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const port = Number(process.argv[3]) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
};

async function isFile(p) {
  try {
    return (await fs.stat(p)).isFile();
  } catch {
    return false;
  }
}

function isInside(target) {
  const rel = path.relative(root, target);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

async function resolveFile(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  } catch {
    return null;
  }

  let target = path.join(root, path.normalize(pathname));
  if (!isInside(target)) return null;

  const candidates = pathname.endsWith("/")
    ? [path.join(target, "index.html")]
    : [target, target + ".html", path.join(target, "index.html")];

  for (const candidate of candidates) {
    if (await isFile(candidate)) {
      const real = await fs.realpath(candidate);
      if (isInside(real)) return real;
    }
  }
  return null;
}

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'none'",
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      return send(res, 405, "text/plain; charset=utf-8", "405 Method Not Allowed");
    }
    const file = await resolveFile(req.url || "/");
    if (!file) {
      const notFound = path.join(root, "404.html");
      if (await isFile(notFound)) {
        return send(res, 404, MIME[".html"], await fs.readFile(notFound));
      }
      return send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    }
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    send(res, 200, type, await fs.readFile(file));
  } catch (err) {
    console.error(err);
    send(res, 500, "text/plain; charset=utf-8", "500 Internal Server Error");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: .\\start.ps1 -Port <other>`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving static export: ${root}`);
  console.log(`  -> http://localhost:${port}`);
  console.log("Press Ctrl+C to stop.");
});
'@

    $serverFile = Join-Path ([System.IO.Path]::GetTempPath()) ("milchis-serve-{0}.mjs" -f [guid]::NewGuid().ToString('N'))
    [System.IO.File]::WriteAllText($serverFile, $serverJs, (New-Object System.Text.UTF8Encoding($false)))

    try {
        Write-Host "Serving static export at http://localhost:$Port ..." -ForegroundColor Cyan
        if ($Open) { Start-Process "http://localhost:$Port" }
        & node $serverFile $outDir "$Port"
    }
    finally {
        Remove-Item -LiteralPath $serverFile -Force -ErrorAction SilentlyContinue
    }
}
finally {
    Pop-Location
}
