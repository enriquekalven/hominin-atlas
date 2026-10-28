// Screenshot helper for dev harness pages. Usage:
//   node scripts/shot.mjs <baseUrl> <outDir> <name>=<path?query> [...]
// Launches the locally installed Google Chrome headless (no downloads) and waits for window.__ready.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [base, outDir, ...shots] = process.argv.slice(2);
if (!base || !outDir || shots.length === 0) {
  console.error('usage: node scripts/shot.mjs <baseUrl> <outDir> name=/path?query ...');
  process.exit(2);
}
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) {
  console.error('baseUrl must be http://127.0.0.1:<port>');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});
const width = Number(process.env.SHOT_W ?? 900);
const height = Number(process.env.SHOT_H ?? 900);
const page = await browser.newPage({ viewport: { width, height } });
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning' || process.env.SHOT_VERBOSE) console.log(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));
for (const spec of shots) {
  const eq = spec.indexOf('=');
  const name = spec.slice(0, eq);
  const path = spec.slice(eq + 1);
  if (!/^[a-z0-9_-]+$/i.test(name) || !path.startsWith('/')) {
    console.error(`bad spec ${spec}`);
    continue;
  }
  const t0 = Date.now();
  await page.goto(base + path, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: Number(process.env.SHOT_TIMEOUT ?? 120000) });
  if (process.env.SHOT_DELAY) await page.waitForTimeout(Number(process.env.SHOT_DELAY));
  const file = join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`${name}: ${file} (${Date.now() - t0} ms)`);
}
await browser.close();
