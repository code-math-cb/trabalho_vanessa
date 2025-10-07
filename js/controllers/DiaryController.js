import { loadEntries, saveEntries } from '../storage.js';
import { showToast, formatMoodLabel, escapeHtml, getDayBounds } from '../utils.js';

export class DiaryController {
  constructor({ moodForm, moodNoteEl, clearTodayBtn, entriesList, moodChart }) {
    // elementos do formulário e lista
    this.moodForm = moodForm;
    this.moodNoteEl = moodNoteEl;
    this.clearTodayBtn = clearTodayBtn;
    this.entriesList = entriesList;
    // canvas do gráfico
    this.moodChart = moodChart;
  }

  init() {
    // o init faz o bind de eventos e um render inicial para
    // garantir que a UI esteja sincronizada com o storage ao carregar.
    this.bindEvents();
    this.renderEntries();
  }

  bindEvents() {
    this.moodForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const formData = new FormData(this.moodForm);
      const moodValue = formData.get('mood');
      const note = this.moodNoteEl.value.trim();
      if (!moodValue) {
        showToast('Selecione um humor antes de salvar.');
        return;
      }
      const entry = {
        id: Date.now().toString(),
        mood: Number(moodValue),
        note,
        createdAt: new Date().toISOString(),
      };
      const entries = loadEntries();
      entries.unshift(entry);
      saveEntries(entries);
      this.renderEntries();
      this.renderChart();
      this.moodForm.reset();
      showToast('Entrada salva. Bom dia de autocuidado 🌱');
    });

    this.clearTodayBtn.addEventListener('click', () => {
      this.moodForm.reset();
    });

    this.entriesList.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-action="delete"]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!confirm('Excluir esta entrada? Esta ação não pode ser desfeita.')) return;
      let entries = loadEntries();
      entries = entries.filter((e) => e.id !== id);
      saveEntries(entries);
      // re-render para refletir remoção e atualizar gráfico
      this.renderEntries();
      this.renderChart();
      showToast('Entrada excluída.');
    });
  }

  renderEntries() {
    const entries = loadEntries();
    this.entriesList.innerHTML = '';
    if (entries.length === 0) {
      this.entriesList.innerHTML = '<li class="muted">Nenhuma entrada registrada ainda.</li>';
      return;
    }
    entries.slice(0, 20).forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'entry-item';
      const date = new Date(entry.createdAt);
      li.innerHTML = `
      <div class="meta"><strong>${formatMoodLabel(
        entry.mood
      )}</strong> • <span class="muted">${date.toLocaleString()}</span></div>
      <div class="note">${escapeHtml(entry.note || '')}</div>
      <div class="entry-actions"><button class="btn" data-id="${
        entry.id
      }" data-action="delete">Excluir</button></div>
    `;
      this.entriesList.appendChild(li);
    });
  }

  renderChart() {
    // cálculo do gráfico separado via helper utilitário para
    // legibilidade e reaproveitamento (getDayBounds).
    const ctx = this.moodChart.getContext('2d');
    const entries = loadEntries();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const values = days.map((d) => {
      const { startISO, endISO } = getDayBounds(d);
      const dayEntries = entries.filter(
        (ent) => ent.createdAt >= startISO && ent.createdAt <= endISO
      );
      if (dayEntries.length === 0) return null;
      const avg = dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length;
      return avg;
    });
    const w = this.moodChart.width;
    const h = this.moodChart.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f0f7fb';
    ctx.fillRect(0, 0, w, h);
    const padding = 20;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;
    const barW = graphW / days.length - 8;
    days.forEach((d, i) => {
      const x = padding + i * (barW + 8) + 4;
      const val = values[i];
      const yBase = padding + graphH;
      if (val === null) {
        ctx.fillStyle = '#e6eef8';
        ctx.fillRect(x, yBase - 2, barW, 2);
      } else {
        const norm = (val - 1) / 4;
        const barH = Math.max(6, graphH * norm);
        ctx.fillStyle = '#7fd3b0';
        ctx.fillRect(x, yBase - barH, barW, barH);
        ctx.fillStyle = '#0b2440';
        ctx.font = '12px sans-serif';
        ctx.fillText(val.toFixed(1), x, yBase - barH - 6);
      }
      ctx.fillStyle = '#4b5563';
      ctx.font = '11px sans-serif';
      // abreviação do dia (seg, ter, ... de acordo com locale)
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      ctx.fillText(label, x, yBase + 14);
    });
  }
}
