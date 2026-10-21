/**
 * Client-side filtering for the server-rendered project list.
 *
 * State lives in the URL (?area=security&skill=Python) so filtered views can be
 * shared and the competency cards can link straight into a filter. The script
 * never creates content; it only shows/hides rows that are already in the HTML.
 */

interface FilterState {
  area: string;
  skill: string;
}

export function initProjectFilter(root: Document = document): void {
  const controls = root.querySelector<HTMLElement>('[data-filters]');
  const list = root.querySelector<HTMLElement>('[data-project-list]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const clear = root.querySelector<HTMLButtonElement>('[data-clear]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const select = root.querySelector<HTMLSelectElement>('[data-skill]');
  if (!controls || !list || !status || !clear || !empty || !select) return;
  setup(root, { controls, list, status, clear, empty, select });
}

interface Elements {
  controls: HTMLElement;
  list: HTMLElement;
  status: HTMLElement;
  clear: HTMLButtonElement;
  empty: HTMLElement;
  select: HTMLSelectElement;
}

function setup(root: Document, { controls, list, status, clear, empty, select }: Elements): void {
  const chips = [...controls.querySelectorAll<HTMLButtonElement>('[data-area]')];
  const rows = [...list.querySelectorAll<HTMLElement>(':scope > li')].map((el) => ({
    el,
    areas: (el.dataset.categories ?? '').split(' '),
    skills: (el.dataset.skills ?? '').split('|'),
  }));
  const total = rows.length;
  const areaLabels = new Map(chips.map((c) => [c.dataset.area ?? '', c.dataset.label ?? '']));
  const validArea = (a: string) => areaLabels.has(a);
  const validSkill = (s: string) => [...select.options].some((o) => o.value === s);

  const fromUrl = (): FilterState => {
    const params = new URLSearchParams(location.search);
    const area = params.get('area') ?? '';
    const skill = params.get('skill') ?? '';
    return { area: validArea(area) ? area : '', skill: validSkill(skill) ? skill : '' };
  };

  let state = fromUrl();

  function render(): void {
    let visible = 0;
    for (const row of rows) {
      const show = (!state.area || row.areas.includes(state.area)) && (!state.skill || row.skills.includes(state.skill));
      row.el.hidden = !show;
      if (show) visible++;
    }

    for (const chip of chips) chip.setAttribute('aria-pressed', String((chip.dataset.area ?? '') === state.area));
    select.value = state.skill;

    const filtered = Boolean(state.area || state.skill);
    clear.hidden = !filtered;
    empty.hidden = visible > 0;
    status.textContent = filtered
      ? `${visible} of ${total} projects` +
        (state.area ? ` in ${areaLabels.get(state.area)}` : '') +
        (state.skill ? ` using ${state.skill}` : '') +
        '.'
      : `${total} projects. Open one for details.`;
  }

  function update(next: Partial<FilterState>): void {
    state = { ...state, ...next };
    const url = new URL(location.href);
    for (const key of ['area', 'skill'] as const) {
      if (state[key]) url.searchParams.set(key, state[key]);
      else url.searchParams.delete(key);
    }
    history.replaceState(null, '', url);
    render();
  }

  for (const chip of chips) chip.addEventListener('click', () => update({ area: chip.dataset.area ?? '' }));
  select.addEventListener('change', () => update({ skill: select.value }));
  clear.addEventListener('click', () => update({ area: '', skill: '' }));

  // Competency cards link to "?area=<id>#projects": filter in place instead of reloading.
  root.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('[data-area-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    update({ area: link.dataset.areaLink ?? '', skill: '' });
    root.getElementById('projects')?.scrollIntoView();
    root.getElementById('projects-title')?.focus({ preventScroll: true });
  });

  controls.hidden = false;
  render();
}
