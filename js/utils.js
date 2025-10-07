/* Helper: converte mood number -> label (nome e emoji) */
export function formatMoodLabel(m) {
  switch (m) {
    case 5:
      return 'Muito Bem 😀';
    case 4:
      return 'Bem 🙂';
    case 3:
      return 'Neutro 😐';
    case 2:
      return 'Triste ☹️';
    case 1:
      return 'Muito Triste 😢';
    default:
      return 'Indefinido';
  }
}

/* escape simples para evitar HTML na nota */
export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (s) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[s];
  });
}

/* ======== TOASTS SIMPLES ======== */
export function showToast(msg, ms = 2000) {
  const t = document.createElement('div');
  t.className = 'jorny-toast';
  t.textContent = msg;
  // estilos inline para simplicidade; poderia ser movido ao CSS se preferir
  Object.assign(t.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    background: 'rgba(8,25,40,0.9)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    zIndex: 1200,
  });
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 300ms';
    t.style.opacity = '0';
  }, ms - 300);
  setTimeout(() => t.remove(), ms);
}

export function getDayBounds(d) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  end.setHours(23, 59, 59, 999);
  // retornos em ISO para permitir comparação lexicográfica segura
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export function pickRandom(arr, n) {
  const copy = arr.slice();
  const out = [];
  // sorteio simples sem repetição removendo do array cópia
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
