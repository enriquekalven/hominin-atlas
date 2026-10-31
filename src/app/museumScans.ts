/**
 * Bundled CC0 Smithsonian NMNH 3D surface scans (`/scans/*.glb`) and curated open-access
 * museum 3D osteology repositories. Network loading lives in `src/app/` (never `src/ui/`)
 * and validates every binary buffer through `validateScan` before emitting `'scan:load'`.
 */
import type { EventBus } from './events';
import { validateScan } from './scanFile';

export interface MuseumScanPreset {
  id: string;
  title: string;
  taxon: string;
  catalog: string;
  element: string;
  fileName: string;
  sizeLabel: string;
  credit: string;
  sourceUrl: string;
}

export interface OpenAccessRepo {
  name: string;
  institution: string;
  href: string;
  note: string;
}

export const MUSEUM_SCAN_PRESETS: readonly MuseumScanPreset[] = [
  {
    id: 'usnm-176236-cranium',
    title: 'Chimpanzee cranium (USNM 176236)',
    taxon: 'Pan troglodytes',
    catalog: 'USNM 176236',
    element: 'Cranium',
    fileName: 'usnm-176236-pan-troglodytes-cranium.glb',
    sizeLabel: '1.4 MB · CC0',
    credit: 'Smithsonian NMNH Digitization Program Office (CC0 1.0)',
    sourceUrl: 'https://3d.si.edu',
  },
  {
    id: 'usnm-398227-mandible',
    title: 'Bonobo mandible (USNM 398227)',
    taxon: 'Pan paniscus',
    catalog: 'USNM 398227',
    element: 'Mandible',
    fileName: 'usnm-398227-pan-paniscus-mandible.glb',
    sizeLabel: '0.8 MB · CC0',
    credit: 'Smithsonian NMNH Digitization Program Office (CC0 1.0)',
    sourceUrl: 'https://3d.si.edu',
  },
  {
    id: 'usnm-398227-femur',
    title: 'Bonobo femur (USNM 398227)',
    taxon: 'Pan paniscus',
    catalog: 'USNM 398227',
    element: 'Femur',
    fileName: 'usnm-398227-pan-paniscus-femur.glb',
    sizeLabel: '1.1 MB · CC0',
    credit: 'Smithsonian NMNH Digitization Program Office (CC0 1.0)',
    sourceUrl: 'https://3d.si.edu',
  },
  {
    id: 'usnm-590942-cranium',
    title: 'Western lowland gorilla cranium (USNM 590942)',
    taxon: 'Gorilla gorilla',
    catalog: 'USNM 590942',
    element: 'Cranium (comparative hominid outgroup)',
    fileName: 'usnm-590942-gorilla-cranium.glb',
    sizeLabel: '1.9 MB · CC0',
    credit: 'Smithsonian NMNH Digitization Program Office (CC0 1.0)',
    sourceUrl: 'https://3d.si.edu',
  },
];

export const OPEN_ACCESS_REPOSITORIES: readonly OpenAccessRepo[] = [
  {
    name: 'MorphoSource',
    institution: 'Duke University · Rising Star (H. naledi), Malapa (A. sediba), Taung & KNM casts',
    href: 'https://www.morphosource.org',
    note: 'Download .stl / .ply meshes and drop them directly onto this stage.',
  },
  {
    name: 'Smithsonian 3D Digitization',
    institution: 'National Museum of Natural History (CC0)',
    href: 'https://3d.si.edu',
    note: 'Open-access CC0 hominoid osteology and classic fossil hominin casts in .glb / .stl.',
  },
  {
    name: 'African Fossils',
    institution: 'National Museums of Kenya & Turkana Basin Institute',
    href: 'https://africanfossils.org',
    note: 'Photogrammetric 3D models of KNM-WT 15000, KNM-ER 1470, KNM-ER 1813, and OH 5.',
  },
  {
    name: 'NHM London 3D Collection',
    institution: 'Natural History Museum, London',
    href: 'https://sketchfab.com/nhm_london',
    note: ' Downloadable surface meshes including Kabwe 1 (Broken Hill) and Gibraltar 1.',
  },
];

export function mountMuseumScans(events: EventBus): () => void {
  let inflight = false;
  return events.on('scan:preset', ({ presetId }) => {
    if (inflight) return;
    const preset = MUSEUM_SCAN_PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      events.emit('scan:preset-error', { message: 'Unknown museum scan preset.' });
      return;
    }
    inflight = true;
    void (async () => {
      try {
        const res = await fetch(`/scans/${preset.fileName}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        const checked = validateScan(preset.fileName, buffer);
        if (!checked.ok) {
          events.emit('scan:preset-error', { message: checked.reason });
          return;
        }
        events.emit('scan:load', {
          name: `${preset.catalog} (${preset.taxon} ${preset.element.toLowerCase()})`,
          format: checked.format,
          buffer,
        });
      } catch {
        events.emit('scan:preset-error', { message: 'Could not load bundled museum scan.' });
      } finally {
        inflight = false;
      }
    })();
  });
}
