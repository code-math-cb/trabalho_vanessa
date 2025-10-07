/* ======== UTILITÁRIOS DE STORAGE ======== */

// Prefixos/chaves usadas no localStorage
export const KEY_ENTRIES = 'jorny_entries_v1';
export const KEY_POSTS = 'jorny_posts_v1';

// Lê entradas do diário do localStorage
export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY_ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler entradas do localStorage', e);
    return [];
  }
}

// Persiste entradas do diário no localStorage
export function saveEntries(entries) {
  localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
}

// Lê posts da comunidade do localStorage
export function loadPosts() {
  try {
    const raw = localStorage.getItem(KEY_POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler posts', e);
    return [];
  }
}

// Persiste posts da comunidade no localStorage
export function savePosts(posts) {
  localStorage.setItem(KEY_POSTS, JSON.stringify(posts));
}
