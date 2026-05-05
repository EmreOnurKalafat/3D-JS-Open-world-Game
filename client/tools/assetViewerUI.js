// client/tools/assetViewerUI.js — Sidebar panel UI for asset viewer
// Builds category sections, search filter, selection highlighting, toast notifications.

const STYLE = /* css */ `
  #avSidebar {
    position: fixed; left: 0; top: 0; width: 290px; height: 100vh;
    overflow-y: auto; overflow-x: hidden; z-index: 100;
    background: rgba(18, 18, 26, 0.94); color: #cdd6f4;
    font-family: 'Segoe UI', system-ui, sans-serif; font-size: 13px;
    border-right: 1px solid rgba(255,255,255,0.08);
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent;
  }
  #avSidebar::-webkit-scrollbar { width: 5px; }
  #avSidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }

  .av-header {
    padding: 14px 14px 10px; border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky; top: 0; background: rgba(18,18,26,0.96); z-index: 2;
    backdrop-filter: blur(6px);
  }
  .av-header h2 { font-size: 15px; font-weight: 600; margin: 0 0 2px; color: #cdd6f4; }
  .av-header .av-hint { font-size: 11px; color: #6c7086; margin-top: 4px; }

  #avSearch {
    width: 100%; padding: 7px 10px; margin-top: 8px;
    border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
    background: rgba(0,0,0,0.3); color: #cdd6f4; font-size: 12px;
    outline: none; transition: border-color 0.2s;
  }
  #avSearch:focus { border-color: rgba(137,180,250,0.5); }
  #avSearch::placeholder { color: #585b70; }

  .av-category { margin: 0; }
  .av-cat-header {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; cursor: pointer; user-select: none;
    font-weight: 600; font-size: 12px; color: #a6adc8;
    text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
  }
  .av-cat-header:hover { background: rgba(255,255,255,0.03); }
  .av-cat-arrow { font-size: 10px; transition: transform 0.2s; width: 12px; text-align: center; }
  .av-cat-collapsed .av-cat-arrow { transform: rotate(-90deg); }
  .av-cat-count { font-size: 10px; color: #585b70; font-weight: 400; margin-left: auto; }

  .av-sub-header {
    padding: 6px 14px 4px 22px; font-size: 11px; font-weight: 600;
    color: #7c7f92; text-transform: uppercase; letter-spacing: 0.4px;
  }

  .av-asset-list { overflow: hidden; }
  .av-cat-collapsed .av-asset-list { display: none; }
  .av-cat-collapsed .av-sub-header { display: none; }

  .av-asset-item {
    padding: 5px 14px 5px 28px; cursor: pointer; font-size: 12px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: background 0.1s, border-color 0.1s;
    border-left: 2px solid transparent; color: #bac2de;
  }
  .av-asset-item:hover { background: rgba(255,255,255,0.05); }
  .av-asset-item.av-selected {
    background: rgba(137,180,250,0.12); color: #89b4fa;
    border-left-color: #89b4fa;
  }
  .av-asset-item.av-hidden { display: none; }

  #avToast {
    position: fixed; bottom: 28px; left: 314px; z-index: 200;
    background: rgba(30,30,40,0.92); color: #a6e3a1;
    padding: 8px 16px; border-radius: 8px; font-size: 12px;
    pointer-events: none; opacity: 0; transform: translateY(8px);
    transition: opacity 0.25s, transform 0.25s;
    font-family: 'Segoe UI', system-ui, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  #avToast.show { opacity: 1; transform: translateY(0); }
`;

/** @type {string|null} */
let selectedId = null;
/** @type {((entry: object) => void)|null} */
let onSelect = null;
let toastTimer = null;

/**
 * Inject styles and build the sidebar DOM.
 * @param {Array} catalog
 * @param {(entry: object) => void} onAssetSelected
 */
export function initUI(catalog, onAssetSelected) {
  onSelect = onAssetSelected;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // Sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'avSidebar';

  // Header
  const header = document.createElement('div');
  header.className = 'av-header';
  header.innerHTML = '<h2>Asset Viewer</h2>';
  const hint = document.createElement('div');
  hint.className = 'av-hint';
  hint.textContent = 'FreeCam: U | WASD/QE | Shift hızlı | Mouse bakış';
  header.appendChild(hint);

  // Search
  const search = document.createElement('input');
  search.id = 'avSearch';
  search.type = 'text';
  search.placeholder = 'Search assets...';
  search.addEventListener('input', () => filterAssets(search.value));
  header.appendChild(search);
  sidebar.appendChild(header);

  // Build category sections
  const order = [
    ['complexes', null],
    ['world', null],
    ['props', 'kiyafet'],
    ['props', 'market'],
    ['props', 'office'],
    ['props', 'outdoor'],
    ['props', 'decorative'],
    ['vehicles', null],
    ['environment', null],
  ];

  const catLabels = {
    complexes: 'Complexes',
    world: 'World Elements',
    props: 'Props',
    vehicles: 'Vehicles',
    environment: 'Environment',
  };
  const subLabels = {
    kiyafet: 'Kiyafet Magazasi',
    market: 'Market',
    office: 'Office / Indoor',
    outdoor: 'Outdoor',
    decorative: 'Decorative',
  };

  for (const [cat, sub] of order) {
    const entries = catalog.filter(e => e.category === cat && (e.subcategory || null) === sub);
    if (!entries.length) continue;

    const container = document.createElement('div');
    container.className = 'av-category';

    const catHeader = document.createElement('div');
    catHeader.className = 'av-cat-header';
    const label = catLabels[cat] + (sub ? ` — ${subLabels[sub]}` : '');
    catHeader.innerHTML = `<span class="av-cat-arrow">▼</span>${label}<span class="av-cat-count">${entries.length}</span>`;
    catHeader.addEventListener('click', () => container.classList.toggle('av-cat-collapsed'));
    container.appendChild(catHeader);

    const list = document.createElement('div');
    list.className = 'av-asset-list';

    for (const entry of entries) {
      const item = document.createElement('div');
      item.className = 'av-asset-item';
      item.textContent = entry.turkishLabel;
      item.dataset.assetId = entry.id;
      item.dataset.label = entry.label;
      item.dataset.turkish = entry.turkishLabel;
      item.addEventListener('click', () => selectAsset(entry, item));
      list.appendChild(item);
    }
    container.appendChild(list);
    sidebar.appendChild(container);
  }

  // Toast
  const toast = document.createElement('div');
  toast.id = 'avToast';
  sidebar.appendChild(toast);

  document.body.appendChild(sidebar);
}

function selectAsset(entry, itemEl) {
  // Deselect previous
  if (selectedId) {
    const prev = document.querySelector(`[data-asset-id="${selectedId}"]`);
    if (prev) prev.classList.remove('av-selected');
  }
  selectedId = entry.id;
  itemEl.classList.add('av-selected');
  if (onSelect) onSelect(entry);
}

function filterAssets(query) {
  const q = query.toLowerCase();
  const items = document.querySelectorAll('.av-asset-item');
  for (const item of items) {
    const label = (item.dataset.label || '').toLowerCase();
    const turkish = (item.dataset.turkish || '').toLowerCase();
    item.classList.toggle('av-hidden', q.length > 0 && !label.includes(q) && !turkish.includes(q));
  }
}

/**
 * Show a brief toast notification.
 * @param {string} message
 * @param {string} [color='#a6e3a1']
 */
export function showToast(message, color = '#a6e3a1') {
  const toast = document.getElementById('avToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.color = color;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

/**
 * Highlight the sidebar item for a given asset ID (called externally after spawn).
 * @param {string} assetId
 */
export function highlightAsset(assetId) {
  if (selectedId) {
    const prev = document.querySelector(`[data-asset-id="${selectedId}"]`);
    if (prev) prev.classList.remove('av-selected');
  }
  selectedId = assetId;
  const next = document.querySelector(`[data-asset-id="${assetId}"]`);
  if (next) next.classList.add('av-selected');
}
