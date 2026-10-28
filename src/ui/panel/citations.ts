/**
 * Citation list (clinician mode). DOI links resolve via https://doi.org/ and open in a new tab.
 */
import { citationHref, getCitation } from '../../data';
import { externalLink, h } from '../dom';

export function renderCitations(ids: readonly string[], title = 'Sources'): HTMLElement | null {
  if (ids.length === 0) return null;
  const items = ids.map((id) => {
    const c = getCitation(id);
    if (!c) return h('li', { class: 'cite cite--missing' }, `Reference “${id}” is not in the bibliography yet.`);
    const href = citationHref(c);
    const label = c.doi ? `doi:${c.doi}` : 'Link';
    return h(
      'li',
      { class: 'cite' },
      h('span', { class: 'cite__authors' }, c.authors),
      ' ',
      h('span', { class: 'cite__year num' }, `(${c.year})`),
      '. ',
      h('span', { class: 'cite__title' }, c.title),
      c.journal ? [' ', h('i', { class: 'cite__journal' }, c.journal), '.'] : null,
      href ? [' ', externalLink(href, label, { class: 'cite__link' })] : null,
    );
  });
  return h('section', { class: 'cites' }, h('h4', { class: 'section-title' }, title), h('ol', { class: 'cites__list' }, items));
}
