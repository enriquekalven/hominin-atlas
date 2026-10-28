#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITE_ID = 'hominin-atlas';
const QUOTA_PROJECT = process.env.GCP_QUOTA_PROJECT || 'project-maui';

function getAccessToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

function walkFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, baseDir));
    } else if (entry.isFile()) {
      const rel = '/' + path.relative(baseDir, full).split(path.sep).join('/');
      results.push({ fullPath: full, webPath: rel });
    }
  }
  return results;
}

async function apiRequest(url, options = {}) {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': QUOTA_PROJECT,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`HTTP ${res.status} on ${url}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function ensureSiteExists() {
  try {
    await apiRequest(
      `https://firebasehosting.googleapis.com/v1beta1/projects/${QUOTA_PROJECT}/sites/${SITE_ID}`
    );
  } catch (err) {
    if (err.status === 404) {
      console.log(`Creating Firebase Hosting site "${SITE_ID}" in project "${QUOTA_PROJECT}"...`);
      await apiRequest(
        `https://firebasehosting.googleapis.com/v1beta1/projects/${QUOTA_PROJECT}/sites?siteId=${encodeURIComponent(SITE_ID)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );
    } else {
      throw err;
    }
  }
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`dist/ directory not found at ${DIST_DIR}. Run npm run build first.`);
  }

  await ensureSiteExists();

  const firebaseJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'firebase.json'), 'utf8'));
  const files = walkFiles(DIST_DIR);
  console.log(`Preparing ${files.length} files from dist/ for Firebase Hosting site "${SITE_ID}"...`);

  const fileMap = {};
  const gzipCache = new Map();

  for (const f of files) {
    const raw = fs.readFileSync(f.fullPath);
    const gzipped = zlib.gzipSync(raw, { level: 9 });
    const hash = crypto.createHash('sha256').update(gzipped).digest('hex');
    fileMap[f.webPath] = hash;
    gzipCache.set(hash, { gzipped, webPath: f.webPath });
  }

  const hostingCfg = firebaseJson.hosting || {};
  const versionConfig = {
    rewrites: (hostingCfg.rewrites || []).map((r) => ({
      glob: r.source,
      path: r.destination,
    })),
    headers: (hostingCfg.headers || []).map((h) => {
      const hdrMap = {};
      for (const item of h.headers || []) {
        hdrMap[item.key] = item.value;
      }
      return { glob: h.source, headers: hdrMap };
    }),
  };

  const version = await apiRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: versionConfig }),
    }
  );
  console.log('Created version:', version.name);

  const entries = Object.entries(fileMap);
  const BATCH_SIZE = 500;
  let uploadUrl = null;
  const requiredHashes = new Set();

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const chunk = Object.fromEntries(entries.slice(i, i + BATCH_SIZE));
    const pop = await apiRequest(
      `https://firebasehosting.googleapis.com/v1beta1/${version.name}:populateFiles`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: chunk }),
      }
    );
    if (pop.uploadUrl) uploadUrl = pop.uploadUrl;
    for (const h of pop.uploadRequiredHashes || []) {
      requiredHashes.add(h);
    }
  }

  console.log(`Uploading ${requiredHashes.size} new/modified file blobs...`);
  const hashList = [...requiredHashes];
  let idx = 0;
  let uploaded = 0;

  async function uploadWorker() {
    while (idx < hashList.length) {
      const h = hashList[idx++];
      const item = gzipCache.get(h);
      const token = getAccessToken();
      const res = await fetch(`${uploadUrl}/${h}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-goog-user-project': QUOTA_PROJECT,
          'Content-Type': 'application/octet-stream',
        },
        body: item.gzipped,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Upload failed for ${item.webPath} (${h}): ${res.status} ${err}`);
      }
      uploaded++;
      if (uploaded % 10 === 0 || uploaded === hashList.length) {
        console.log(`  Uploaded [${uploaded}/${hashList.length}] (${item.webPath})`);
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => uploadWorker()));

  const finalized = await apiRequest(
    `https://firebasehosting.googleapis.com/v1beta1/${version.name}?update_mask=status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'FINALIZED' }),
    }
  );
  console.log('Finalized version:', finalized.status);

  const release = await apiRequest(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${SITE_ID}/releases?versionName=${encodeURIComponent(version.name)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Deploy Hominin Atlas 3D viewer' }),
    }
  );
  console.log(`Released live to https://${SITE_ID}.web.app ! Release:`, release.name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
