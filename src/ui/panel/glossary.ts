/**
 * Glossary tab: searchable terms; definitions follow the audience (kids vs clinician).
 * Typing only re-renders the results list, so the search field keeps focus.
 */
import { GLOSSARY } from '../../data';
import type { UICtx } from '../context';
import { h, uid } from '../dom';
import { filterGlossary } from '../filters';
import { emptyState } from '../widgets';
import type { TabView } from './index';

export function createGlossaryTab(ctx: UICtx): TabView {
  let query = '';
  return {
    key: (s) => s.audience,
    render(pane) {
      const audience = ctx.store.get().audience;
      const kids = audience === 'kids';
      if (GLOSSARY.length === 0) {
        pane.appendChild(emptyState(kids ? 'Word list coming soon' : 'Glossary not available yet', 'Definitions are still being written.'));
        return;
      }
      const id = uid('gloss');
      const input = h('input', {
        id,
        type: 'search',
        class: 'input',
        placeholder: kids ? 'Type a word…' : 'Filter terms and definitions…',
        autocomplete: 'off',
        spellcheck: 'false',
        'data-fk': 'glossary-search',
      });
      input.value = query;
      const status = h('p', { class: 'muted', role: 'status' });
      const list = h('dl', { class: 'glossary' });
      const renderList = () => {
        const items = filterGlossary(GLOSSARY, query, audience);
        status.textContent =
          items.length === GLOSSARY.length ? `${items.length} terms` : `${items.length} of ${GLOSSARY.length} terms match`;
        if (items.length === 0) {
          list.replaceChildren(h('div', { class: 'glossary__none' }, `No terms match “${query.trim()}”.`));
          return;
        }
        list.replaceChildren(
          ...items.flatMap((t) => [h('dt', { class: 'glossary__term' }, t.term), h('dd', { class: 'glossary__def' }, kids ? t.kids : t.clinician)]),
        );
      };
      input.addEventListener('input', () => {
        query = input.value;
        renderList();
      });
      renderList();
      pane.append(h('div', { class: 'field' }, h('label', { for: id }, kids ? 'Look up a word' : 'Search glossary'), input), status, list);
    },
  };
}
