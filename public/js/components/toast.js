// GridWatch Toast Notification Component

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let existing = document.getElementById('toast-container');
    if (!existing) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = existing;
    }
  }

  show({ title, message, type = 'info', duration = 4000 }) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '⚡';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, duration);
  }

  success(title, message, duration) {
    this.show({ title, message, type: 'success', duration });
  }

  error(title, message, duration = 5000) {
    this.show({ title, message, type: 'error', duration });
  }

  warning(title, message, duration = 4500) {
    this.show({ title, message, type: 'warning', duration });
  }

  info(title, message, duration) {
    this.show({ title, message, type: 'info', duration });
  }
}

window.toast = new ToastManager();
