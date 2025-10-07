import { DiaryController } from './controllers/DiaryController.js';
import { NavController } from './controllers/NavController.js';
import { AutocareController } from './controllers/AutocareController.js';
import { EmergencyController } from './controllers/EmergencyController.js';
import { CommunityController } from './controllers/CommunityController.js';

function init() {
  const moodForm = document.getElementById('mood-form');
  const entriesList = document.getElementById('entries-list');
  const moodChart = document.getElementById('mood-chart');
  const clearTodayBtn = document.getElementById('clear-today');
  const moodNoteEl = document.getElementById('mood-note');
  const mainNavLinks = document.querySelectorAll('.main-nav a');

  const autocareGrid = document.getElementById('autocare-grid');
  const newSuggestionBtn = document.getElementById('new-suggestion');

  const panicBtn = document.getElementById('panic-btn');
  const emergencyModal = document.getElementById('emergency-modal');
  const closeEmergency = document.getElementById('close-emergency');
  const callCvv = document.getElementById('call-cvv');

  const postForm = document.getElementById('post-form');
  const postsList = document.getElementById('posts-list');

  const diary = new DiaryController({
    moodForm,
    moodNoteEl,
    clearTodayBtn,
    entriesList,
    moodChart,
  });
  diary.init();
  diary.renderChart();

  const nav = new NavController({ mainNavLinks });
  nav.init();

  const autocare = new AutocareController({ autocareGrid, newSuggestionBtn });
  autocare.init();

  const emergency = new EmergencyController({ panicBtn, emergencyModal, closeEmergency, callCvv });
  emergency.init();

  const community = new CommunityController({ postForm, postsList });
  community.init();

  const heroStartBtn = document.getElementById('hero-start');
  const heroAboutBtn = document.getElementById('hero-about');
  const diarySection = document.getElementById('diary-section');
  const brandEl = document.querySelector('.brand');
  heroStartBtn.addEventListener('click', () => {
    diarySection.scrollIntoView({ behavior: 'smooth' });
  });
  heroAboutBtn.addEventListener('click', () => {
    brandEl.scrollIntoView({ behavior: 'smooth' });
  });

  const moodInputs = document.querySelectorAll('.mood input[name="mood"]');
  moodInputs.forEach((inp) => {
    inp.addEventListener('change', (ev) => {
      document.querySelectorAll('.mood').forEach((m) => m.classList.remove('selected'));
      const lab = ev.target.closest('.mood');
      if (lab) lab.classList.add('selected');
    });
  });
}

init();
