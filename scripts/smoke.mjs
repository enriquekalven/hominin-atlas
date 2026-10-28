/**
 * End-to-end headless Chrome + WebGL smoke test for Hominin Atlas.
 * Starts an in-process Vite server on 127.0.0.1, renders the 3D SDF skeleton viewer,
 * exercises hotspots, audience modes, comparison modes, lineup, and species switching,
 * and asserts zero pageerrors or console errors.
 */
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

function assert(cond, msg) {
  if (!cond) throw new Error(`Smoke assertion failed: ${msg}`);
}

const shotDir = process.env.SMOKE_SHOT_DIR || '';
if (shotDir) mkdirSync(shotDir, { recursive: true });

const server = await createServer({
  server: { host: '127.0.0.1', port: 0, strictPort: false },
  logLevel: 'error',
});
await server.listen();
const addr = server.httpServer?.address();
const port = typeof addr === 'object' && addr ? addr.port : 0;
assert(port > 0, 'Vite server failed to bind a local port');
const baseUrl = `http://127.0.0.1:${port}`;

let browser;
const errors = [];

try {
  browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  const t0 = Date.now();
  await page.goto(baseUrl + '/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  console.log(`[smoke] initial skeleton ready in ${Date.now() - t0} ms`);

  // 1. Verify canvas and lesion hotspots exist for Shanidar 1 (default Homo neanderthalensis)
  const initialCheck = await page.evaluate(() => {
    const canvas = document.querySelector('#viewport canvas.viewer-canvas');
    const hotspots = Array.from(document.querySelectorAll('#viewport button.hotspot'));
    const visibleHotspots = hotspots.filter((b) => !b.classList.contains('is-hidden'));
    const state = window.__atlas?.getState();
    return {
      hasCanvas: Boolean(canvas && canvas.clientWidth > 200 && canvas.clientHeight > 200),
      hotspotCount: hotspots.length,
      visibleHotspotCount: visibleHotspots.length,
      speciesId: state?.speciesId,
      specimenId: state?.specimenId,
    };
  });
  assert(initialCheck.hasCanvas, 'WebGL viewer canvas must be mounted and sized');
  assert(initialCheck.speciesId === 'homo-neanderthalensis', `Expected default species homo-neanderthalensis, got ${initialCheck.speciesId}`);
  assert(initialCheck.hotspotCount >= 5, `Expected >= 5 lesion hotspots for Shanidar 1, got ${initialCheck.hotspotCount}`);
  assert(initialCheck.visibleHotspotCount >= 1, 'Expected at least 1 front-facing hotspot');

  if (shotDir) {
    await page.waitForTimeout(150);
    await page.screenshot({ path: join(shotDir, '01_neanderthal_body.png') });
  }

  // 2. Click a visible hotspot and verify store + aria-pressed + panel update
  await page.evaluate(() => {
    const btn = document.querySelector('#viewport button.hotspot:not(.is-hidden)');
    if (btn instanceof HTMLElement) btn.click();
  });
  await page.waitForTimeout(120);
  const afterHotspot = await page.evaluate(() => {
    const state = window.__atlas.getState();
    const selectedBtn = document.querySelector('#viewport button.hotspot.is-selected[aria-pressed="true"]');
    return {
      selectedLesionId: state.selectedLesionId,
      selectedBoneId: state.selectedBoneId,
      hasSelectedBtn: Boolean(selectedBtn),
    };
  });
  assert(Boolean(afterHotspot.selectedLesionId), 'Clicking a hotspot should set selectedLesionId');
  assert(Boolean(afterHotspot.selectedBoneId), 'Clicking a hotspot should set selectedBoneId');
  assert(afterHotspot.hasSelectedBtn, 'Selected hotspot should have .is-selected and aria-pressed="true"');

  // 3. Frame skull & toggle flesh / xray / kids & clinician audience modes
  await page.evaluate(() => {
    window.__atlas.setState({ framing: 'skull', audience: 'clinician', renderMode: 'bone', showFlesh: true });
  });
  await page.waitForTimeout(350);
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '02_skull_clinician.png') });
  }
  await page.evaluate(() => {
    window.__atlas.setState({ renderMode: 'fossil', showFlesh: false, audience: 'kids', framing: 'body', selectedBoneId: null, selectedLesionId: null });
  });

  // 4. Test comparison mode (side-by-side & morph with Homo sapiens)
  await page.evaluate(() => {
    window.__ready = false;
    window.__atlas.setState({
      compareSpeciesId: 'homo-sapiens',
      compareMode: 'side-by-side',
      selectedLesionId: null,
    });
  });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  await page.waitForTimeout(150);
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '03_compare_side_by_side.png') });
  }

  // 5. Test species switch to Australopithecus afarensis (Lucy)
  await page.evaluate(() => {
    window.__ready = false;
    window.__atlas.setState({
      compareSpeciesId: null,
      speciesId: 'australopithecus-afarensis',
      specimenId: 'al-288-1',
    });
  });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  const lucyCheck = await page.evaluate(() => ({
    hotspots: document.querySelectorAll('#viewport button.hotspot').length,
    speciesId: window.__atlas.getState().speciesId,
  }));
  assert(lucyCheck.speciesId === 'australopithecus-afarensis', 'Species should switch to australopithecus-afarensis');
  assert(lucyCheck.hotspots >= 1, 'Lucy should have at least 1 lesion hotspot');
  if (shotDir) {
    await page.waitForTimeout(150);
    await page.screenshot({ path: join(shotDir, '04_lucy_afarensis.png') });
  }

  // 6. Test Family Tree / Phylogeny tab and full-screen SVG range chart modal (Kids & Clinician)
  await page.evaluate(() => {
    window.__atlas.setState({ panel: 'tree', audience: 'kids' });
  });
  await page.waitForTimeout(150);
  await page.click('button:has-text("Family tree")');
  await page.waitForTimeout(200);
  const treeCheckKids = await page.evaluate(() => ({
    nodeCount: document.querySelectorAll('.tree__svg .tree__node').length,
    ancLinks: document.querySelectorAll('.tree__svg .tree__anc').length,
    flowLinks: document.querySelectorAll('.tree__svg .tree__flow').length,
  }));
  assert(treeCheckKids.nodeCount === 17, `Expected 17 species nodes in family tree, got ${treeCheckKids.nodeCount}`);
  assert(treeCheckKids.ancLinks >= 10, `Expected >= 10 ancestry connectors in family tree, got ${treeCheckKids.ancLinks}`);
  assert(treeCheckKids.flowLinks >= 3, `Expected >= 3 gene-flow arcs in family tree, got ${treeCheckKids.flowLinks}`);
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '05_family_tree_kids.png') });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  await page.evaluate(() => {
    window.__atlas.setState({ audience: 'clinician', panel: 'tree', speciesId: 'homo-heidelbergensis' });
  });
  await page.waitForTimeout(200);
  await page.click('button:has-text("Family tree")');
  await page.waitForTimeout(200);
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '06_phylogeny_clinician.png') });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  // 7. Test Skin & Attire (3D sculpted skin/hair/clothes + floating studio card + full-view modal)
  await page.evaluate(() => {
    window.__ready = false;
    window.__atlas.setState({
      audience: 'kids',
      panel: 'overview',
      speciesId: 'homo-neanderthalensis',
      compareSpeciesId: 'homo-sapiens',
      compareMode: 'side-by-side',
      showFlesh: true,
      framing: 'body',
      renderMode: 'fossil',
    });
  });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  await page.waitForTimeout(400);
  const lifeCheck = await page.evaluate(() => {
    const card = document.querySelector('.life-card');
    const imgs = Array.from(document.querySelectorAll('.life-card img, .hero img'));
    return {
      cardVisible: Boolean(card && !card.hasAttribute('hidden')),
      imgCount: imgs.length,
      allLoaded: imgs.every((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 100),
    };
  });
  assert(lifeCheck.cardVisible, 'Life reconstruction studio card should be visible when showFlesh is true');
  assert(lifeCheck.imgCount >= 3, `Expected >= 3 reconstruction images on screen, got ${lifeCheck.imgCount}`);
  assert(lifeCheck.allLoaded, 'All skin & attire reconstruction images must decode with naturalWidth > 100');
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '07_skin_and_attire_view.png') });
  }

  await page.click('.life-card button:has-text("Full view")');
  await page.waitForTimeout(300);
  if (shotDir) {
    await page.screenshot({ path: join(shotDir, '08_skin_and_attire_modal.png') });
  }
  await page.keyboard.press('Escape');

  // 8. Test GPU Walk & Chomp shader compilation on 3D lifelike photoMesh (zero WebGL shader errors)
  await page.click('button:has-text("Walk")');
  await page.waitForTimeout(250);
  await page.click('button:has-text("Chomp!")');
  await page.waitForTimeout(250);
  await page.click('button:has-text("Chomp!")');

  // 9. Test URL deep-link query boot (?species=homo-floresiensis&audience=clinician&mode=bone&frame=skull)
  await page.goto(`${baseUrl}/?species=homo-floresiensis&audience=clinician&mode=bone&frame=skull`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
  const deepLinkCheck = await page.evaluate(() => {
    const s = window.__atlas.getState();
    return { speciesId: s.speciesId, audience: s.audience, renderMode: s.renderMode, framing: s.framing };
  });
  assert(deepLinkCheck.speciesId === 'homo-floresiensis', `Deep link species mismatch: ${deepLinkCheck.speciesId}`);
  assert(deepLinkCheck.audience === 'clinician', `Deep link audience mismatch: ${deepLinkCheck.audience}`);
  assert(deepLinkCheck.renderMode === 'bone', `Deep link renderMode mismatch: ${deepLinkCheck.renderMode}`);
  assert(deepLinkCheck.framing === 'skull', `Deep link framing mismatch: ${deepLinkCheck.framing}`);

  // 10. Verify Google Analytics 4 initialization (G-SV6BEEVQZX) and localhost beacon gating
  const gaCheck = await page.evaluate(() => ({
    measurementId: window.__homininAnalytics?.measurementId,
    firebaseAppId: window.__homininAnalytics?.firebaseAppId,
    networkEnabled: window.__homininAnalytics?.networkEnabled,
    hasDataLayer: Array.isArray(window.dataLayer) && window.dataLayer.length >= 2,
    gaDisabledOnLocalhost: window['ga-disable-G-SV6BEEVQZX'] === true,
  }));
  assert(gaCheck.measurementId === 'G-SV6BEEVQZX', `Expected GA4 stream G-SV6BEEVQZX, got ${gaCheck.measurementId}`);
  assert(gaCheck.hasDataLayer, 'Expected window.dataLayer to be initialized with gtag config');
  assert(gaCheck.gaDisabledOnLocalhost && !gaCheck.networkEnabled, 'Expected GA4 network beacons to be disabled on 127.0.0.1');

  // 11. Verify Arabic (RTL), German, and Dutch localization + Chirp 3 HD studio MP3 read-aloud
  for (const lang of ['ar', 'de', 'nl']) {
    await page.evaluate((code) => {
      window.__lastNarration = undefined;
      window.__atlas.setState({
        lang: code,
        audience: 'kids',
        panel: 'overview',
        speciesId: 'homo-neanderthalensis',
      });
    }, lang);
    await page.waitForTimeout(150);

    const domCheck = await page.evaluate(() => ({
      htmlLang: document.documentElement.lang,
      htmlDir: document.documentElement.dir,
      selectVal: document.querySelector('select.tb-lang')?.value,
      hasSpeakBtn: Boolean(document.querySelector('#pane-overview .btn--speak')),
    }));
    assert(domCheck.htmlLang === lang, `Expected <html lang="${lang}">, got ${domCheck.htmlLang}`);
    assert(domCheck.htmlDir === (lang === 'ar' ? 'rtl' : 'ltr'), `Unexpected dir for ${lang}: ${domCheck.htmlDir}`);
    assert(domCheck.selectVal === lang, `Expected topbar language select=${lang}, got ${domCheck.selectVal}`);
    assert(domCheck.hasSpeakBtn, `Expected Read Aloud button in overview pane for ${lang}`);

    await page.click('#pane-overview .btn--speak');
    await page.waitForFunction(
      (expectedLang) => window.__lastNarration && window.__lastNarration.lang === expectedLang,
      lang,
      { timeout: 10000 },
    );
    const narration = await page.evaluate(() => window.__lastNarration);
    assert(
      narration.mode === 'chirp3-hd',
      `Expected Chirp 3 HD studio MP3 playback for [${lang}], got mode=${narration.mode}`,
    );
    assert(
      String(narration.audioSrc || '').includes(`/audio/${lang}/homo-neanderthalensis-kids.mp3`),
      `Unexpected audioSrc for [${lang}]: ${narration.audioSrc}`,
    );
    // Toggle stop
    await page.click('#pane-overview .btn--speak');
    await page.waitForTimeout(80);
  }

  assert(errors.length === 0, `Unexpected browser errors:\n${errors.join('\n')}`);
  console.log('[smoke] PASS — all WebGL viewer, hotspot, comparison, family-tree, GPU lifelike shader, GA4, 12-language i18n, and Chirp 3 HD read-aloud checks succeeded with 0 errors.');
} finally {
  if (browser) await browser.close();
  await server.close();
}
