export class EmergencyController {
  constructor({ panicBtn, emergencyModal, closeEmergency, callCvv }) {
    this.panicBtn = panicBtn;
    this.emergencyModal = emergencyModal;
    this.closeEmergency = closeEmergency;
    this.callCvv = callCvv;
  }
  init() {
    this.bindEvents();
  }
  bindEvents() {
    this.panicBtn.addEventListener('click', () => {
      this.emergencyModal.setAttribute('aria-hidden', 'false');
    });
    this.closeEmergency.addEventListener('click', () => {
      this.emergencyModal.setAttribute('aria-hidden', 'true');
    });
    this.callCvv.addEventListener('click', () => {
      // Em uma aplicação real, aqui poderíamos abrir um link telefone:188 (só funciona em dispositivos)
      window.location.href = 'tel:188';
    });
  }
}
