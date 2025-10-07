// encapsular a geração de cards e eventos
// e facilita a expansão do catálogo de sugestões.
import { showToast, pickRandom } from '../utils.js';

// Lista de sugestões
const SUGGESTIONS = [
  { title: 'Respiração 4-4-4', desc: 'Inspire 4s, segure 4s, expire 4s — repita 4 vezes.' },
  { title: 'Caminhada curta', desc: 'Saia por 10 minutos e respire ar puro.' },
  { title: 'Música relaxante', desc: 'Ouça uma música calma por 5-10 minutos.' },
  { title: 'Alongamento', desc: 'Alongue pescoço, ombros e costas por 5 minutos.' },
  { title: "Copo d'água", desc: 'Beba água devagar e respire fundo.' },
  { title: 'Ancoragem', desc: 'Liste 5 coisas que você vê, 4 que ouve, 3 que sente.' },
];

export class AutocareController {
  constructor({ autocareGrid, newSuggestionBtn }) {
    this.autocareGrid = autocareGrid;
    this.newSuggestionBtn = newSuggestionBtn;
  }
  init() {
    this.bindEvents();
    // gera um conjunto inicial de sugestões ao carregar
    this.renderAutocare();
  }
  bindEvents() {
    this.autocareGrid.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-action="do"]');
      if (!btn) return;
      const title = btn.dataset.title;
      showToast(`Iniciando: ${title}`);
    });
    this.newSuggestionBtn.addEventListener('click', () => {
      this.renderAutocare();
    });
  }
  renderAutocare() {
    this.autocareGrid.innerHTML = '';
    const picks = pickRandom(SUGGESTIONS, 2);
    picks.forEach((s) => {
      const div = document.createElement('div');
      div.className = 'autocare-card';
      div.innerHTML = `<h4>${s.title}</h4><p class="muted">${s.desc}</p><div><button class="btn" data-action="do" data-title="${s.title}">Fazer agora</button></div>`;
      this.autocareGrid.appendChild(div);
    });
  }
}
