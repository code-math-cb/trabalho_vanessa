/**
 * main.js — controle principal do Jorny
 * Comentários em português explicativos em todo o arquivo.
 *
 * Funcionalidades:
 *  - Registrar humor + nota
 *  - Persistir no localStorage (chave: jorny_entries)
 *  - Gerar histórico semanal simples em canvas
 *  - Sugestões de autocuidado aleatórias
 *  - Lista de contatos / modal de emergência
 *  - Publicar posts de comunidade (persistidos localmente)
 */

/* ======== UTILITÁRIOS DE STORAGE ======== */

// Prefixos/chaves usadas no localStorage
const KEY_ENTRIES = 'jorny_entries_v1';
const KEY_POSTS = 'jorny_posts_v1';

// Retorna array de entradas (ou array vazio)
function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY_ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler entradas do localStorage', e);
    return [];
  }
}

// Salva array de entradas
function saveEntries(entries) {
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
}

// Carrega posts
function loadPosts() {
  try {
    const raw = localStorage.getItem(KEY_POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler posts', e);
    return [];
  }
}

// Salva posts
function savePosts(posts) {
  localStorage.setItem(KEY_POSTS, JSON.stringify(posts));
}

/* ======== DIÁRIO / HUMOR ======== */

const moodForm = document.getElementById('mood-form');
const entriesList = document.getElementById('entries-list');
const moodChart = document.getElementById('mood-chart'); // canvas

// Salvar entrada (tomada no submit)
moodForm.addEventListener('submit', function (ev) {
  ev.preventDefault();

  // Pegar o valor do humor (radio checked)
  const formData = new FormData(moodForm);
  const moodValue = formData.get('mood'); // string '1'..'5'
  const note = document.getElementById('mood-note').value.trim();

  if (!moodValue) {
    showToast('Selecione um humor antes de salvar.');
    return;
  }

  // Monta objeto de entrada
  const entry = {
    id: Date.now().toString(),
    mood: Number(moodValue),
    note: note,
    createdAt: new Date().toISOString()
  };

  // Carrega, adiciona e salva
  const entries = loadEntries();
  entries.unshift(entry); // insere no início (recente primeiro)
  saveEntries(entries);

  // Atualiza UI
  renderEntries();
  renderChart();
  moodForm.reset();
  showToast('Entrada salva. Bom dia de autocuidado 🌱');
});

// Limpar (botão limpar)
document.getElementById('clear-today').addEventListener('click', function () {
  // apenas limpa campos do formulário (não remove entradas)
  moodForm.reset();
});

/* ======== RENDERIZAÇÃO DE ENTRADAS ======== */
function renderEntries() {
  const entries = loadEntries();
  entriesList.innerHTML = '';

  if (entries.length === 0) {
    entriesList.innerHTML = '<li class="muted">Nenhuma entrada registrada ainda.</li>';
    return;
  }

  entries.slice(0, 20).forEach(entry => {
    const li = document.createElement('li');
    li.className = 'entry-item';
    const date = new Date(entry.createdAt);
    li.innerHTML = `
      <div class="meta"><strong>${formatMoodLabel(entry.mood)}</strong> • <span class="muted">${date.toLocaleString()}</span></div>
      <div class="note">${escapeHtml(entry.note || '')}</div>
      <div class="entry-actions"><button class="btn" data-id="${entry.id}" data-action="delete">Excluir</button></div>
    `;
    entriesList.appendChild(li);
  });
}

// Delegação para excluir entradas rapidamente
entriesList.addEventListener('click', function (ev) {
  const btn = ev.target.closest('button[data-action="delete"]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!confirm('Excluir esta entrada? Esta ação não pode ser desfeita.')) return;

  let entries = loadEntries();
  entries = entries.filter(e => e.id !== id);
  saveEntries(entries);
  renderEntries();
  renderChart();
  showToast('Entrada excluída.');
});

  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // evita o salto seco padrão
      
      const alvo = document.querySelector(this.getAttribute('href'));
      if (alvo) {
        // Rolagem dinâmica e suave
        alvo.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

/* ======== GRÁFICO SIMPLES (Canvas) ========
   - Mostra média diária dos últimos 7 dias
   - Implementação leve sem libs externas
=========================================== */
function renderChart() {
  const ctx = moodChart.getContext('2d');
  const entries = loadEntries();

  // Prepara labels (últimos 7 dias: hoje, -1, -2 ...)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  // Para cada dia, calcula média do mood (ou null)
  const values = days.map(d => {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const dayEndDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dayEndDate.setHours(23, 59, 59, 999);
    const dayEnd = dayEndDate.toISOString();

    const dayEntries = entries.filter(ent => ent.createdAt >= dayStart && ent.createdAt <= dayEnd);
    if (dayEntries.length === 0) return null;
    const avg = dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length;
    return avg;
  });

  // Limpa canvas
  const w = moodChart.width;
  const h = moodChart.height;
  ctx.clearRect(0, 0, w, h);

  // Estilos
  ctx.fillStyle = '#f0f7fb';
  ctx.fillRect(0, 0, w, h);

  // eixo e margens
  const padding = 20;
  const graphW = w - padding * 2;
  const graphH = h - padding * 2;

  // desenhar barras
  const barW = graphW / days.length - 8;
  days.forEach((d, i) => {
    const x = padding + i * (barW + 8) + 4;
    const val = values[i];
    const yBase = padding + graphH;
    if (val === null) {
      // barra vazia (linha pontilhada)
      ctx.fillStyle = '#e6eef8';
      ctx.fillRect(x, yBase - 2, barW, 2);
    } else {
      // valor entre 1 e 5 -> normalizar entre 0 e 1
      const norm = (val - 1) / 4; // 0..1
      const barH = Math.max(6, graphH * norm);
      // cor suave baseada no valor
      ctx.fillStyle = '#7fd3b0';
      ctx.fillRect(x, yBase - barH, barW, barH);
      // valor numérico
      ctx.fillStyle = '#0b2440';
      ctx.font = '12px sans-serif';
      ctx.fillText(val.toFixed(1), x, yBase - barH - 6);
    }

    // label de dia (abreviado)
    ctx.fillStyle = '#4b5563';
    ctx.font = '11px sans-serif';
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    ctx.fillText(label, x, yBase + 14);
  });
}

/* Helper: converte mood number -> label */
function formatMoodLabel(m) {
  switch (m) {
    case 5: return 'Muito Bem 😀';
    case 4: return 'Bem 🙂';
    case 3: return 'Neutro 😐';
    case 2: return 'Triste ☹️';
    case 1: return 'Muito Triste 😢';
    default: return 'Indefinido';
  }
}

/* escape simples para evitar HTML na nota */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[s];
  });
}

/* ======== AUTOCUIDADO ======== */

// Lista de sugestões (pode ser expandida)
const SUGGESTIONS = [
  { title: 'Respiração 4-4-4', desc: 'Inspire 4s, segure 4s, expire 4s — repita 4 vezes.' },
  { title: 'Caminhada curta', desc: 'Saia por 10 minutos e respire ar puro.' },
  { title: 'Música relaxante', desc: 'Ouça uma música calma por 5-10 minutos.' },
  { title: 'Alongamento', desc: 'Alongue pescoço, ombros e costas por 5 minutos.' },
  { title: 'Copo d\'água', desc: 'Beba água devagar e respire fundo.' },
  { title: 'Ancoragem', desc: 'Liste 5 coisas que você vê, 4 que ouve, 3 que sente.' }
];

const autocareGrid = document.getElementById('autocare-grid');
const newSuggestionBtn = document.getElementById('new-suggestion');

function renderAutocare() {
  autocareGrid.innerHTML = '';
  // mostrará 2 sugestões iniciais
  const picks = pickRandom(SUGGESTIONS, 2);
  picks.forEach(s => {
    const div = document.createElement('div');
    div.className = 'autocare-card';
    div.innerHTML = `<h4>${s.title}</h4><p class="muted">${s.desc}</p><div><button class="btn" data-action="do" data-title="${s.title}">Fazer agora</button></div>`;
    autocareGrid.appendChild(div);
  });
}

// Escolhe n itens aleatórios sem repetição
function pickRandom(arr, n) {
  const copy = arr.slice();
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// Delegação para botões "Fazer agora"
autocareGrid.addEventListener('click', function (ev) {
  const btn = ev.target.closest('button[data-action="do"]');
  if (!btn) return;
  const title = btn.dataset.title;
  showToast(`Iniciando: ${title}`);
});

newSuggestionBtn.addEventListener('click', function () {
  renderAutocare();
});

/* ======== APOIO / EMERGÊNCIA ======== */
const panicBtn = document.getElementById('panic-btn');
const emergencyModal = document.getElementById('emergency-modal');
const closeEmergency = document.getElementById('close-emergency');
const callCvv = document.getElementById('call-cvv');

panicBtn.addEventListener('click', function () {
  emergencyModal.setAttribute('aria-hidden', 'false');
});

closeEmergency.addEventListener('click', function () {
  emergencyModal.setAttribute('aria-hidden', 'true');
});

callCvv.addEventListener('click', function () {
  // Em uma aplicação real, aqui poderíamos abrir um link telefone:188 (só funciona em dispositivos)
  window.location.href = 'tel:188';
});

/* ======== COMUNIDADE (posts simples) ======== */
const postForm = document.getElementById('post-form');
const postsList = document.getElementById('posts-list');

postForm.addEventListener('submit', function (ev) {
  ev.preventDefault();
  const name = document.getElementById('post-name').value.trim() || 'Anônimo';
  const text = document.getElementById('post-text').value.trim();
  if (!text) { showToast('Escreva algo antes de publicar.'); return; }
  const posts = loadPosts();
  const post = { id: Date.now().toString(), name, text, createdAt: new Date().toISOString() };
  posts.unshift(post);
  savePosts(posts);
  renderPosts();
  postForm.reset();
  showToast('Publicado na comunidade. Lembre-se de ser gentil ❤️');
});

function renderPosts() {
  const posts = loadPosts();
  postsList.innerHTML = '';
  if (posts.length === 0) {
    postsList.innerHTML = '<p class="muted">Nenhum post ainda. Seja o primeiro a compartilhar!</p>';
    return;
  }
  posts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'post';
    const date = new Date(p.createdAt);
    div.innerHTML = `<div class="meta"><strong>${escapeHtml(p.name)}</strong> • <span class="muted">${date.toLocaleString()}</span></div><div class="text">${escapeHtml(p.text)}</div>`;
    postsList.appendChild(div);
  });
}

/* ======== TOASTS SIMPLES ======== */
function showToast(msg, ms = 2000) {
  const t = document.createElement('div');
  t.className = 'jorny-toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', right: '16px', bottom: '16px',
    background: 'rgba(8,25,40,0.9)', color: 'white', padding: '8px 12px',
    borderRadius: '8px', zIndex: 1200
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity 300ms'; t.style.opacity = '0'; }, ms - 300);
  setTimeout(() => t.remove(), ms);
}

/* ======== INICIALIZAÇÃO ======== */
function init() {
  renderEntries();
  renderChart();
  renderAutocare();
  renderPosts();

  // CTA / navegação suave
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // CTA hero
  document.getElementById('hero-start').addEventListener('click', () => {
    document.getElementById('diary-section').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('hero-about').addEventListener('click', () => {
    document.querySelector('.brand').scrollIntoView({ behavior: 'smooth' });
  });

  // Marca seleção visual de mood (estilização por JS para feedback)
  document.querySelectorAll('.mood input[name="mood"]').forEach(inp => {
    inp.addEventListener('change', (ev) => {
      document.querySelectorAll('.mood').forEach(m => m.classList.remove('selected'));
      const lab = ev.target.closest('.mood');
      if (lab) lab.classList.add('selected');
    });
  });
}

init();
