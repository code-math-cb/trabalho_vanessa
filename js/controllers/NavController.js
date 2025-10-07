// centralizar listeners de navegação para manter a semântica clara
// e evitar duplicação de lógica
export class NavController {
  constructor({ mainNavLinks }) {
    this.mainNavLinks = mainNavLinks;
  }
  init() {
    this.bindEvents();
  }
  bindEvents() {
    this.mainNavLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const alvo = document.querySelector(this.getAttribute('href'));
        if (alvo) {
          alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
}
