/**
 * Line icons (24×24 grid, stroke = currentColor) built with createElementNS.
 * Entries starting with "F:" are filled shapes instead of strokes.
 */
import { s } from './dom';

const CIRCLE = (cx: number, cy: number, r: number): string =>
  `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0z`;

const PATHS = {
  search: [CIRCLE(11, 11, 6.5), 'M16 16l4.5 4.5'],
  tree: [CIRCLE(12, 5, 2), CIRCLE(6, 19, 2), CIRCLE(18, 19, 2), 'M12 7v5M6 17v-5h12v5'],
  lineup: ['M3 21h18', 'M6 21v-6', 'M10 21v-11', 'M14 21v-15', 'M18 21v-9'],
  quiz: ['M9 6h11M9 12h11M9 18h11', 'M3.5 6l1.2 1.2L7 5', 'M3.5 12l1.2 1.2L7 11', 'M3.5 18l1.2 1.2L7 17'],
  book: ['M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z', 'M5 19.5A1.5 1.5 0 0 0 6.5 21H19', 'M9 7h6'],
  help: [CIRCLE(12, 12, 9), 'M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.6', 'M12 17.2v.1'],
  upload: ['M12 15V4', 'M7.5 8.5L12 4l4.5 4.5', 'M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  camera: ['M4 8h3.2l1.8-3h6l1.8 3H20v11H4z', CIRCLE(12, 13, 3.4)],
  reset: [CIRCLE(12, 12, 5), 'M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4'],
  rotate: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4v4.5H15'],
  outline: [CIRCLE(12, 5, 2.2), 'M8 21l1.2-7.5L7 11l1.5-2.5h7L17 11l-2.2 2.5L16 21'],
  ghost: ['M7.5 4.5a2.2 2.2 0 0 0-3 3 2.2 2.2 0 0 0 2.7 2.7l6.6 6.6a2.2 2.2 0 0 0 2.7 2.7 2.2 2.2 0 0 0 3-3 2.2 2.2 0 0 0-2.7-2.7l-6.6-6.6a2.2 2.2 0 0 0-2.7-2.7z'],
  ruler: ['M3.5 16.5l13-13 4 4-13 13z', 'M7.5 12.5l2 2', 'M10.5 9.5l2 2', 'M13.5 6.5l2 2'],
  section: ['M2.5 12h19', 'M6 8.5L12 4.5l6 4', 'M6 15.5l6 4 6-4'],
  speaker: ['M4 9.5h3.5L12 5.5v13l-4.5-4H4z', 'M15.5 9a4 4 0 0 1 0 6', 'M18 6.5a7.5 7.5 0 0 1 0 11'],
  stop: ['F:M7 7h10v10H7z'],
  chevronLeft: ['M14.5 6l-6 6 6 6'],
  chevronRight: ['M9.5 6l6 6-6 6'],
  chevronDown: ['M6 9.5l6 6 6-6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  established: [CIRCLE(12, 12, 9), 'M7.8 12.3l2.8 2.8 5.6-5.8'],
  probable: [CIRCLE(12, 12, 9), 'F:M12 3a9 9 0 0 1 0 18z'],
  debated: ['M4 8.5h13', 'M14 5.5l3 3-3 3', 'M20 15.5H7', 'M10 12.5l-3 3 3 3'],
  pin: ['M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 1 1 13 0C18.5 15 12 21 12 21z', CIRCLE(12, 9.8, 2.3)],
  chomp: ['M7 3.5c-2 0-3 1.7-3 3.8 0 2.7 1.1 4.6 1.9 7.4.6 2.2 1 5.8 2.4 5.8 1.6 0 1.6-3.8 2.2-5.6.3-1 .8-1.4 1.5-1.4s1.2.4 1.5 1.4c.6 1.8.6 5.6 2.2 5.6 1.4 0 1.8-3.6 2.4-5.8.8-2.8 1.9-4.7 1.9-7.4 0-2.1-1-3.8-3-3.8-1.9 0-3 1-5 1s-3.1-1-5-1z'],
  walk: [
    'M8 3c1.6 0 2.4 1.9 2.4 4.2S9.5 11.5 8 11.5 5.6 9.5 5.6 7.2 6.4 3 8 3z',
    'M6 13.5h4v1.7a2 2 0 0 1-4 0z',
    'M16 8.5c1.6 0 2.4 1.9 2.4 4.2S17.5 17 16 17s-2.4-2-2.4-4.3.8-4.2 2.4-4.2z',
    'M14 19h4v.5a2 2 0 0 1-4 0z',
  ],
  warning: ['M12 3.5l9.5 16.5h-19z', 'M12 10v4.5', 'M12 17.3v.1'],
  info: [CIRCLE(12, 12, 9), 'M12 11v5.5', 'M12 7.8v.1'],
  layers: ['M12 4l9 5-9 5-9-5z', 'M3 14l9 5 9-5'],
  sun: [CIRCLE(12, 12, 4), 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2'],
  link: ['M10 13a5 5 0 0 0 7.1.4l2.1-2.1a5 5 0 0 0-7.1-7.1L10.8 5.5', 'M14 11a5 5 0 0 0-7.1-.4l-2.1 2.1a5 5 0 0 0 7.1 7.1l1.3-1.3'],
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName, extraClass = ''): SVGSVGElement {
  const svg = s('svg', {
    class: `icon icon--${name}${extraClass ? ` ${extraClass}` : ''}`,
    viewBox: '0 0 24 24',
    width: 20,
    height: 20,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  for (const raw of PATHS[name]) {
    const filled = raw.startsWith('F:');
    svg.appendChild(s('path', { d: filled ? raw.slice(2) : raw, class: filled ? 'icon-fill' : null }));
  }
  return svg;
}
