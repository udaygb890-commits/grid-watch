// GridWatch Minimal Role Selection & Login View
// Matching reference screenshot specifications

class LoginView {
  constructor() {
    this.step = 'selection'; // 'selection' | 'login'
    this.selectedRole = null; // 'admin' | 'control_room' | 'substation_team'
    this.isSubmitting = false;

    // Check if URL has a role query param (e.g. /login?role=admin)
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['admin', 'control_room', 'substation_team'].includes(roleParam)) {
      this.selectedRole = roleParam;
      this.step = 'login';
    }
  }

  getRoleMeta(role) {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin',
          subtitle: 'System management and configuration',
          placeholder: 'e.g. admin.gridwatch',
          defaultUsername: 'admin.gridwatch',
          defaultPassword: 'Admin@GridWatch2026!'
        };
      case 'control_room':
        return {
          title: 'Control Room',
          subtitle: 'Network monitoring and alert coordination',
          placeholder: 'e.g. cr.operator',
          defaultUsername: 'cr.operator',
          defaultPassword: 'Control@GridWatch2026!'
        };
      case 'substation_team':
      default:
        return {
          title: 'Substation Team',
          subtitle: 'Station operations and field engineer access',
          placeholder: 'e.g. operator.sub12 or engineer.field',
          defaultUsername: 'engineer.field',
          defaultPassword: 'Field@GridWatch2026!'
        };
    }
  }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <!-- Slim Top Navigation Bar -->
      <header class="gw-header">
        <div class="gw-header-left" id="gw-header-logo-btn" title="GridWatch Home">
          <span class="gw-brand-text">
            <span class="gw-brand-grid">GRID</span><span class="gw-brand-watch">WATCH</span>
          </span>
        </div>
        <div class="gw-header-right">
          <button type="button" class="gw-header-link" id="gw-header-login-btn">Login</button>
        </div>
      </header>

      <!-- Main Page Content -->
      <main class="gw-page-wrapper">
        <div class="gw-container" id="gw-main-content">
          ${this.step === 'selection' ? this.renderSelectionStep() : this.renderLoginStep()}
        </div>
      </main>
    `;

    this.bindEvents();
  }

  // STEP 1: Role Selection (Exact match to screenshot)
  renderSelectionStep() {
    return `
      <!-- Heading & Subtitle -->
      <div class="gw-title-group">
        <h1 class="gw-main-title">Sign in as</h1>
        <p class="gw-subtitle">Pick a role to load the right view</p>
      </div>

      <!-- Exactly three vertically stacked cards in specified order -->
      <div class="gw-cards-list" role="list">
        <!-- 1. Admin -->
        <div class="gw-role-card" data-role="admin" role="button" tabindex="0">
          <div class="gw-role-card-title">Admin</div>
          <p class="gw-role-card-desc">System management and configuration</p>
        </div>

        <!-- 2. Control Room -->
        <div class="gw-role-card" data-role="control_room" role="button" tabindex="0">
          <div class="gw-role-card-title">Control Room</div>
          <p class="gw-role-card-desc">Network monitoring and alert coordination</p>
        </div>

        <!-- 3. Substation Team -->
        <div class="gw-role-card" data-role="substation_team" role="button" tabindex="0">
          <div class="gw-role-card-title">Substation Team</div>
          <p class="gw-role-card-desc">Station operations and field engineer access</p>
        </div>
      </div>
    `;
  }

  // STEP 2: Selected Role Login Form
  renderLoginStep() {
    const meta = this.getRoleMeta(this.selectedRole);

    return `
      <!-- Back to Role Selection Button -->
      <button type="button" class="gw-back-link" id="btn-back-to-roles">
        <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Role Selection
      </button>

      <!-- Role-specific Header -->
      <div class="gw-title-group">
        <h1 class="gw-main-title">Sign in as ${meta.title}</h1>
        <p class="gw-subtitle">${meta.subtitle}</p>
      </div>

      <!-- Clean Login Card -->
      <div class="gw-login-card">
        <!-- Error Alert Banner -->
        <div id="gw-alert-box" class="gw-alert-banner" style="display: none;"></div>

        <form id="gw-login-form" novalidate autocomplete="on">
          <!-- Username / Identifier -->
          <div class="gw-form-group">
            <label class="gw-label" for="gw-username-input">Operator Identifier / Username</label>
            <div class="gw-input-wrapper">
              <input 
                type="text" 
                id="gw-username-input" 
                class="gw-input" 
                placeholder="${meta.placeholder}" 
                required 
                autocomplete="username"
              />
            </div>
          </div>

          <!-- Password with Show/Hide Toggle -->
          <div class="gw-form-group">
            <label class="gw-label" for="gw-password-input">Password</label>
            <div class="gw-input-wrapper">
              <input 
                type="password" 
                id="gw-password-input" 
                class="gw-input gw-input-password" 
                placeholder="Enter account password" 
                required 
                autocomplete="current-password"
              />
              <button type="button" class="gw-pwd-toggle-btn" id="gw-pwd-toggle" title="Toggle password visibility">
                <!-- Eye Show Icon -->
                <svg id="eye-icon-show" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <!-- Eye Hide Icon -->
                <svg id="eye-icon-hide" viewBox="0 0 24 24" style="display: none;">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Options: Remember Me -->
          <div class="gw-form-options">
            <label class="gw-checkbox-label">
              <input type="checkbox" id="gw-remember-me" checked />
              <span>Remember session</span>
            </label>
          </div>

          <!-- Login Submit Button -->
          <button type="submit" class="gw-btn-submit" id="gw-login-btn">
            <span id="gw-btn-label">Login</span>
            <span id="gw-btn-spinner" style="display: none;">Verifying...</span>
          </button>
        </form>

        <!-- Quick-Fill Demo Helpers -->
        <div class="gw-demo-helper">
          <div class="gw-demo-header">
            <span>Quick-fill test account</span>
            <span>1-CLICK</span>
          </div>
          <div class="gw-demo-chips">
            ${this.renderDemoChipsForRole(this.selectedRole)}
          </div>
        </div>
      </div>
    `;
  }

  renderDemoChipsForRole(role) {
    if (role === 'admin') {
      return `
        <button type="button" class="gw-demo-chip" data-user="admin.gridwatch" data-pass="Admin@GridWatch2026!">
          <strong>admin.gridwatch</strong> &bull; Elena Rostova (Admin)
        </button>
      `;
    }

    if (role === 'control_room') {
      return `
        <button type="button" class="gw-demo-chip" data-user="cr.operator" data-pass="Control@GridWatch2026!">
          <strong>cr.operator</strong> &bull; Marcus Vance (Dispatch)
        </button>
      `;
    }

    // Substation Team: includes both Field Engineer & Station Operator!
    return `
      <button type="button" class="gw-demo-chip" data-user="engineer.field" data-pass="Field@GridWatch2026!">
        <strong>engineer.field</strong> &bull; Devon Reed (Field Engineer)
      </button>
      <button type="button" class="gw-demo-chip" data-user="operator.sub12" data-pass="Station@GridWatch2026!">
        <strong>operator.sub12</strong> &bull; Sarah Chen (Station Operator)
      </button>
      <button type="button" class="gw-demo-chip" data-user="admin.gridwatch" data-pass="Admin@GridWatch2026!" style="opacity: 0.7;" title="Test role mismatch rejection">
        <span style="color: #FF7B72;">Test Mismatch (Admin ID)</span>
      </button>
    `;
  }

  bindEvents() {
    // 1. Logo / Header Login click
    document.getElementById('gw-header-logo-btn')?.addEventListener('click', () => {
      this.switchStep('selection');
    });

    document.getElementById('gw-header-login-btn')?.addEventListener('click', () => {
      this.switchStep('selection');
    });

    // 2. Role Cards click in Selection Step
    if (this.step === 'selection') {
      document.querySelectorAll('.gw-role-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const role = e.currentTarget.dataset.role;
          this.selectedRole = role;
          this.switchStep('login');
        });

        // Keyboard navigation (Enter / Space)
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const role = e.currentTarget.dataset.role;
            this.selectedRole = role;
            this.switchStep('login');
          }
        });
      });
    }

    // 3. Login Step events
    if (this.step === 'login') {
      // Back to Roles button
      document.getElementById('btn-back-to-roles')?.addEventListener('click', () => {
        this.switchStep('selection');
      });

      // Password toggle
      const pwdInput = document.getElementById('gw-password-input');
      const toggleBtn = document.getElementById('gw-pwd-toggle');
      const eyeShow = document.getElementById('eye-icon-show');
      const eyeHide = document.getElementById('eye-icon-hide');

      if (toggleBtn && pwdInput) {
        toggleBtn.addEventListener('click', () => {
          const isPassword = pwdInput.getAttribute('type') === 'password';
          pwdInput.setAttribute('type', isPassword ? 'text' : 'password');
          if (eyeShow && eyeHide) {
            eyeShow.style.display = isPassword ? 'none' : 'block';
            eyeHide.style.display = isPassword ? 'block' : 'none';
          }
        });
      }

      // Quick-fill chips
      document.querySelectorAll('.gw-demo-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const u = chip.dataset.user;
          const p = chip.dataset.pass;
          const userInput = document.getElementById('gw-username-input');
          const passInput = document.getElementById('gw-password-input');
          if (userInput) userInput.value = u;
          if (passInput) passInput.value = p;
        });
      });

      // Form submit
      const form = document.getElementById('gw-login-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.handleLogin();
        });
      }
    }
  }

  switchStep(newStep) {
    this.step = newStep;
    if (newStep === 'selection') {
      this.selectedRole = null;
      if (window.history.pushState) {
        window.history.pushState(null, '', '/login');
      }
    } else if (newStep === 'login') {
      if (window.history.pushState) {
        window.history.pushState(null, '', `/login?role=${this.selectedRole}`);
      }
    }

    const contentArea = document.getElementById('gw-main-content');
    if (contentArea) {
      contentArea.innerHTML = this.step === 'selection' ? this.renderSelectionStep() : this.renderLoginStep();
      this.bindEvents();
    }
  }

  async handleLogin() {
    if (this.isSubmitting) return;

    const userInput = document.getElementById('gw-username-input');
    const passInput = document.getElementById('gw-password-input');
    const rememberCheckbox = document.getElementById('gw-remember-me');
    const alertBox = document.getElementById('gw-alert-box');

    const username = userInput ? userInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : true;

    if (!username || !password) {
      this.showAlert('Please enter both your identifier and password.', 'error');
      return;
    }

    this.setLoading(true);
    if (alertBox) alertBox.style.display = 'none';

    try {
      const result = await window.auth.login({
        username,
        password,
        selectedRole: this.selectedRole,
        rememberMe
      });

      window.toast?.success(
        'Authentication Verified',
        `Welcome ${result.user?.full_name || username}!`
      );

      // Backend returns authorized redirectUrl based on role and job_function:
      // - admin -> /admin
      // - control_room -> /control-room
      // - substation_team (field_engineer) -> /substation/field-engineer
      // - substation_team (station_operator) -> /substation/operator
      const targetUrl = result.redirectUrl || window.router.getAuthorizedRedirectUrl(result.user);
      window.router.navigate(targetUrl);
    } catch (err) {
      this.showAlert(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  showAlert(message) {
    const alertBox = document.getElementById('gw-alert-box');
    if (!alertBox) return;

    alertBox.style.display = 'flex';
    alertBox.innerHTML = `
      <span style="font-size: 15px;">⚠️</span>
      <span>${message}</span>
    `;
  }

  setLoading(isLoading) {
    this.isSubmitting = isLoading;
    const btn = document.getElementById('gw-login-btn');
    const label = document.getElementById('gw-btn-label');
    const spinner = document.getElementById('gw-btn-spinner');

    if (btn) btn.disabled = isLoading;
    if (label) label.style.display = isLoading ? 'none' : 'inline';
    if (spinner) spinner.style.display = isLoading ? 'inline' : 'none';
  }
}

window.LoginView = LoginView;
