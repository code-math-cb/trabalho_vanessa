// separar postagem e renderização simplifica futuras validações
// (ex.: filtros, moderação) sem tocar no restante do app.
import { loadPosts, savePosts } from '../storage.js';
import { showToast, escapeHtml } from '../utils.js';

export class CommunityController {
  constructor({ postForm, postsList }) {
    this.postForm = postForm;
    this.postsList = postsList;
  }
  init() {
    this.bindEvents();
    // render inicial para exibir posts já persistidos
    this.renderPosts();
  }
  bindEvents() {
    this.postForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('post-name').value.trim() || 'Anônimo';
      const text = document.getElementById('post-text').value.trim();
      if (!text) {
        showToast('Escreva algo antes de publicar.');
        return;
      }
      const posts = loadPosts();
      const post = { id: Date.now().toString(), name, text, createdAt: new Date().toISOString() };
      posts.unshift(post);
      savePosts(posts);
      this.renderPosts();
      this.postForm.reset();
      showToast('Publicado na comunidade. Lembre-se de ser gentil ❤️');
    });
  }
  renderPosts() {
    const posts = loadPosts();
    this.postsList.innerHTML = '';
    if (posts.length === 0) {
      this.postsList.innerHTML =
        '<p class="muted">Nenhum post ainda. Seja o primeiro a compartilhar!</p>';
      return;
    }
    posts.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'post';
      const date = new Date(p.createdAt);
      div.innerHTML = `<div class="meta"><strong>${escapeHtml(
        p.name
      )}</strong> • <span class="muted">${date.toLocaleString()}</span></div><div class="text">${escapeHtml(
        p.text
      )}</div>`;
      this.postsList.appendChild(div);
    });
  }
}
