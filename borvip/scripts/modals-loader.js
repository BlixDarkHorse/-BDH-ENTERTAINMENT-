/**
 * =========================================================================
 * MODALS LOADER - NEW PLANET / UNIVERSO BDH
 * Carga diferida de modales de contenido y mapeo de carátulas
 * =========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  // Asegurar clase a todas las etiquetas de carátula
  const selectors = ['#page-inicio label', '#page-originals label', '#page-anime label', '#page-golds label'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(lbl => lbl.classList.add('modal-de-contenido'));
  });

  const CODE_MAP = {
    's32': '92', 'soprano': '92', 'los sopranos': '92',
    's16': '84', 'lost': '84',
    's13': '116', 'got': '116', 'game of thrones': '116',
    's06': '125', 'breaking': '125', 'breaking bad': '125',
    's15': '104', 'papel': '104', 'la casa de papel': '104',
    's08': '97', 'cobra': '97', 'cobra kai': '97',
    'p20': '83', 'scarface': '83', 'caracortada': '83',
    'a38': '77', 'naruto': '77',
    'a44': '35', 'pluto': '35',
    'a50': '24', 'solo': '24', 'solo leveling': '24',
    'a16': '21', 'dandadan': '21', 'dan da dan': '21',
    'p07': '129', 'el rito': '129',
    'p25': '136', 'et': '136', 'e.t.': '136',
    'p26': '137', 'looney': '137', 'looney tunes': '137',
    'p27': '138', 'encuentros': '138', 'tercer tipo': '138'
  };

  function resolveModalId(label) {
    const img = label.querySelector('img');
    const titleEl = label.querySelector('.cover-title') || label.querySelector('h3');
    const titleText = (titleEl ? titleEl.textContent : '').toLowerCase().trim();
    const alt = (img ? (img.getAttribute('alt') || '') : '').toLowerCase().trim();
    const src = (img ? (img.getAttribute('src') || '') : '').toLowerCase().trim();

    // 1. Coincidencia directa de números en alt (ej: "Gold 83" -> "83", "Portada 21" -> "21")
    const altNum = alt.match(/(\d+)/);
    if (altNum && parseInt(altNum[1], 10) > 10) {
      return altNum[1];
    }

    // 2. Coincidencia por código de archivo (ej: S32, S16, A38, P20)
    for (const [key, mid] of Object.entries(CODE_MAP)) {
      if (alt.includes(key) || src.includes(key) || titleText.includes(key)) {
        return mid;
      }
    }

    // 3. Fallback de números en URL
    const srcNum = src.match(/(\d+)\.[a-zA-Z]{2,4}$/);
    if (srcNum) return srcNum[1];

    return '92'; // Los Soprano por defecto si no coincide
  }

  // Interceptor de clics en las carátulas para abrir modales
  document.addEventListener('click', async (e) => {
    const label = e.target.closest('label.modal-de-contenido');
    if (!label) return;
    e.preventDefault();

    const id = resolveModalId(label);
    const modalId = 'modal-' + id;

    // Si ya existe inyectado en el DOM, abrirlo inmediatamente
    let existing = document.getElementById(modalId);
    if (existing) {
      existing.classList.add('open');
      existing.setAttribute('aria-hidden', 'false');
      return;
    }

    // Cargar archivo de modal
    try {
      let res = await fetch(`modals/${modalId}.html`);
      if (!res.ok) res = await fetch(`modals/modal-${id}.html`);
      if (!res.ok) throw new Error('No encontrado: ' + res.status);
      const html = await res.text();
      const container = document.getElementById('external-modals') || document.body;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html.trim();
      const modalEl = wrapper.firstElementChild;
      if (!modalEl) return;
      modalEl.id = modalId;
      modalEl.classList.add('modal-overlay');
      container.appendChild(modalEl);

      requestAnimationFrame(() => {
        modalEl.classList.add('open');
        modalEl.setAttribute('aria-hidden', 'false');
      });

      modalEl.addEventListener('click', (evt) => {
        if (evt.target === modalEl || evt.target.closest('.modal-close')) {
          modalEl.classList.remove('open');
          modalEl.setAttribute('aria-hidden', 'true');
        }
      });

    } catch (err) {
      console.warn('Error cargando modal:', err);
      if (window.WarmHole && typeof window.WarmHole.teleportToPlayer === 'function') {
        window.WarmHole.teleportToPlayer();
      } else {
        window.location.href = `OJO DE KILLROG/KILLROG.html`;
      }
    }
  });
});
