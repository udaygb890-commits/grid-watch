// GridWatch Mobile View Component (Replicating Photo 1 UI)

class MobileView {
  constructor() {
    this.activeTab = 'history'; // Defaults to History to match Photo 1!
    this.isFrameMode = true;
    this.alerts = [];
    this.suggestions = [];
    this.dashboardData = null;
    this.selectedAlert = null;
    this.currentUser = window.auth.user || { full_name: 'Devon Reed', role: 'substation_team' };
  }

  async render(container) {
    this.container = container;
    await this.fetchData();

    container.innerHTML = `
      <div class="mobile-app-viewport">
        <!-- Top Frame Mode & Desktop Portal Switcher -->
        <div class="view-mode-toggle" id="view-mode-toggle" title="Toggle Phone Frame View / Full View">
          <span>📱 Phone Frame</span>
          <span style="opacity: 0.4;">|</span>
          <span id="portal-jump-btn" style="color: var(--phone-teal);">🖥️ Desktop Portal</span>
        </div>

        <!-- Phone Device Frame -->
        <div class="mobile-phone-device ${this.isFrameMode ? 'device-framed' : ''}" id="phone-device-box">
          
          <!-- 1. Android Status Bar (9:55, VoLTE 4G 74% battery, exact match to Photo 1) -->
          <div class="mobile-status-bar">
            <div class="status-left">
              <span class="status-time">9:55</span>
              <div class="status-icons">
                <!-- Discord / chat icon -->
                <svg class="status-icon-img" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                <!-- Download icon -->
                <svg class="status-icon-img" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                <!-- Sound/Volume icon -->
                <svg class="status-icon-img" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              </div>
            </div>

            <div class="status-right">
              <!-- VoLTE badge -->
              <span style="font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.15); padding: 1px 4px; border-radius: 3px;">VoLTE</span>
              <span style="font-size: 11px; font-weight: 700;">4G</span>
              <!-- Network signal bars -->
              <svg style="width: 13px; height: 13px; fill: currentColor;" viewBox="0 0 24 24"><path d="M2 22h20V2z"/></svg>
              <!-- Battery icon + 74% -->
              <div class="battery-badge">
                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                <span>74%</span>
              </div>
            </div>
          </div>

          <!-- 2. In-App Navigation Bar ('✕', 'Grid Watch — Fu...', chat icon, share icon) -->
          <div class="mobile-nav-bar">
            <button type="button" class="nav-action-btn" id="mobile-back-btn" title="Back / Logout">
              ✕
            </button>
            <div class="nav-title-text">Grid Watch — Fleet Monitor</div>
            <div class="nav-right-actions">
              <!-- Notifications / Comments -->
              <button type="button" class="nav-action-btn badge-counter" id="mobile-notifs-btn" title="Alert Notifications">
                <svg style="width: 19px; height: 19px; fill: currentColor;" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <span class="badge-dot"></span>
              </button>
              <!-- Share Icon -->
              <button type="button" class="nav-action-btn" id="mobile-share-btn" title="Share Status Link">
                <svg style="width: 19px; height: 19px; fill: currentColor;" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
              <!-- User Profile / Logout Button -->
              <button type="button" class="nav-action-btn" id="mobile-user-menu-btn" title="User Menu">
                <svg style="width: 19px; height: 19px; fill: currentColor;" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 3. Brand Header Bar (Photo 1: GRID (white) WATCH (amber) + section name) -->
          <div class="mobile-brand-bar">
            <div class="brand-title">
              <span class="brand-grid">GRID</span><span class="brand-watch">WATCH</span>
            </div>
            <div class="brand-section-label" id="brand-active-label">
              ${this.getSectionLabel()}
            </div>
          </div>

          <!-- 4. Dynamic Content Area -->
          <div class="mobile-content-area" id="mobile-content-area">
            ${this.renderActiveTabContent()}
          </div>

          <!-- 5. Bottom Navigation Bar (Photo 1: Dashboard, Suggestions, History) -->
          <div class="mobile-bottom-nav">
            <div class="bottom-nav-tabs" role="tablist">
              <button type="button" class="bottom-tab-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                Dashboard
              </button>
              <button type="button" class="bottom-tab-item ${this.activeTab === 'suggestions' ? 'active' : ''}" data-tab="suggestions">
                Suggestions
              </button>
              <button type="button" class="bottom-tab-item ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">
                History
              </button>
            </div>
            
            <!-- Android Bottom Home Swipe Indicator -->
            <div class="phone-bottom-home-bar">
              <div class="home-indicator-pill"></div>
            </div>
          </div>

        </div>
      </div>

      <!-- Detail Modal Bottom Sheet for Alert Inspection -->
      <div id="alert-detail-modal" class="detail-modal-overlay" style="display: none;">
        <div class="detail-bottom-sheet" id="alert-detail-sheet"></div>
      </div>
    `;

    this.bindEvents();
  }

  getSectionLabel() {
    switch (this.activeTab) {
      case 'dashboard':
        return 'Live Telemetry';
      case 'suggestions':
        return 'AI Recommendations';
      case 'history':
      default:
        return 'History';
    }
  }

  async fetchData() {
    try {
      const [alertsRes, sugsRes, dashRes] = await Promise.all([
        window.api.get('/alerts/history').catch(() => ({ alerts: this.getDefaultAlerts() })),
        window.api.get('/alerts/suggestions').catch(() => ({ suggestions: this.getDefaultSuggestions() })),
        window.api.get('/alerts/mobile-dashboard').catch(() => this.getDefaultDashboard())
      ]);

      this.alerts = alertsRes.alerts || this.getDefaultAlerts();
      this.suggestions = sugsRes.suggestions || this.getDefaultSuggestions();
      this.dashboardData = dashRes || this.getDefaultDashboard();
    } catch (e) {
      this.alerts = this.getDefaultAlerts();
      this.suggestions = this.getDefaultSuggestions();
      this.dashboardData = this.getDefaultDashboard();
    }
  }

  getDefaultAlerts() {
    return [
      {
        id: 1,
        substation_code: 'SS-11',
        substation_name: 'SS-11 Ashok Nagar',
        status: 'Acknowledged',
        timestamp_label: '06:24 today',
        detail: '06:24 today · Oil temp 89°C · Ack by R. Verma in 4 min',
        metric_type: 'Oil Temp',
        metric_value: '89°C',
        acknowledged_by: 'R. Verma',
        response_time_min: 4,
        transformer_id: 'TX-02'
      },
      {
        id: 2,
        substation_code: 'SS-07',
        substation_name: 'SS-07 Khan Colony',
        status: 'Acknowledged',
        timestamp_label: 'Yesterday 21:03',
        detail: 'Yesterday 21:03 · Current spike 210A · Ack in 2 min',
        metric_type: 'Current Spike',
        metric_value: '210A',
        acknowledged_by: 'Control Room Dispatcher',
        response_time_min: 2,
        transformer_id: 'TX-01'
      },
      {
        id: 3,
        substation_code: 'SS-19',
        substation_name: 'SS-19 Lakeview',
        status: 'Acknowledged',
        timestamp_label: '2 days ago',
        detail: '2 days ago · Voltage drop · Ack in 6 min',
        metric_type: 'Voltage Drop',
        metric_value: '10.4kV (-12%)',
        acknowledged_by: 'SCADA Auto-Regulator',
        response_time_min: 6,
        transformer_id: 'TX-03'
      }
    ];
  }

  getDefaultSuggestions() {
    return [
      {
        id: 'sug-1',
        substation: 'SS-11 Ashok Nagar',
        title: 'Thermal Management & Cooling Bank Overhaul',
        urgency: 'HIGH',
        confidence: 94.8,
        summary: 'Predictive thermal model forecasts winding hotspot exceeding 105°C during 18:00 peak demand.',
        actionLabel: 'Dispatch Field Engineer'
      },
      {
        id: 'sug-2',
        substation: 'SS-07 Khan Colony',
        title: 'Feeder Phase-B Current Re-balancing',
        urgency: 'MEDIUM',
        confidence: 89.4,
        summary: 'Periodic 210A transient load spikes observed during commercial HVAC startup cycles.',
        actionLabel: 'Simulate Re-balance'
      },
      {
        id: 'sug-3',
        substation: 'SS-19 Lakeview',
        title: 'OLTC Tap Changer Contact Resistance Diagnostic',
        urgency: 'SCHEDULED',
        confidence: 91.2,
        summary: 'Acoustic sensor detected slight mechanical arcing delay during tap step +2 regulation.',
        actionLabel: 'Schedule Work Order'
      }
    ];
  }

  getDefaultDashboard() {
    return {
      fleetHealth: 88,
      activeSubstations: 4,
      totalTransformers: 12,
      gridFrequency: 50.02,
      substations: [
        { code: 'SS-11', name: 'SS-11 Ashok Nagar', voltage: '132kV / 33kV', status: 'WARNING', oilTemp: 89, windingTemp: 96, loadPct: 92 },
        { code: 'SS-07', name: 'SS-07 Khan Colony', voltage: '220kV / 66kV', status: 'ONLINE', oilTemp: 62, windingTemp: 68, loadPct: 74 },
        { code: 'SS-19', name: 'SS-19 Lakeview', voltage: '66kV / 11kV', status: 'ONLINE', oilTemp: 58, windingTemp: 64, loadPct: 68 },
        { code: 'SS-01', name: 'SS-01 Cascade North', voltage: '500kV / 230kV', status: 'WARNING', oilTemp: 78.6, windingTemp: 94.2, loadPct: 89.4 }
      ]
    };
  }

  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'history':
        return this.renderHistoryTab();
      case 'dashboard':
        return this.renderDashboardTab();
      case 'suggestions':
        return this.renderSuggestionsTab();
      default:
        return this.renderHistoryTab();
    }
  }

  // TAB 3: History (EXACT MATCH to Photo 1)
  renderHistoryTab() {
    return `
      <!-- Header Block (Photo 1: 'Alert history', 'Log of past detections and response') -->
      <div class="screen-header-block">
        <h1 class="screen-title">Alert history</h1>
        <p class="screen-subtitle">Log of past detections and response</p>
      </div>

      <!-- Alert Cards List (Photo 1: SS-11 Ashok Nagar, SS-07 Khan Colony, SS-19 Lakeview) -->
      <div class="alert-cards-list" id="alert-cards-container">
        ${this.alerts.map(a => `
          <div class="alert-history-card" data-id="${a.id}">
            <div class="alert-card-top-row">
              <span class="alert-station-title">${a.substation_name}</span>
              <span class="alert-ack-tag ${a.status === 'Active' ? 'active' : ''}">${a.status}</span>
            </div>
            <div class="alert-card-detail-row">
              ${a.detail}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // TAB 1: Dashboard Tab
  renderDashboardTab() {
    const d = this.dashboardData;
    return `
      <div class="screen-header-block">
        <h1 class="screen-title">Grid Telemetry</h1>
        <p class="screen-subtitle">Real-time SCADA transformer health & bus voltages</p>
      </div>

      <div class="dashboard-metrics-grid">
        <div class="phone-metric-box">
          <div class="metric-box-label">Fleet Health</div>
          <div class="metric-box-val" style="color: var(--phone-teal);">${d.fleetHealth}%</div>
          <div class="metric-box-sub">Nominal condition</div>
        </div>
        <div class="phone-metric-box">
          <div class="metric-box-label">Grid Frequency</div>
          <div class="metric-box-val">${d.gridFrequency} <span style="font-size: 14px;">Hz</span></div>
          <div class="metric-box-sub">Equilibrium locked</div>
        </div>
        <div class="phone-metric-box">
          <div class="metric-box-label">Substations</div>
          <div class="metric-box-val">${d.activeSubstations}</div>
          <div class="metric-box-sub">All monitored online</div>
        </div>
        <div class="phone-metric-box">
          <div class="metric-box-label">Transformers</div>
          <div class="metric-box-val">${d.totalTransformers}</div>
          <div class="metric-box-sub">High-voltage fleet</div>
        </div>
      </div>

      <div style="font-size: 13.5px; font-weight: 700; color: #fff; margin: 18px 0 10px 0; letter-spacing: -0.2px;">
        Monitored Substations
      </div>

      <div>
        ${d.substations.map(s => `
          <div class="live-station-card">
            <div class="station-card-head">
              <span class="station-name">${s.name}</span>
              <span class="station-status-pill ${s.status === 'ONLINE' ? 'online' : 'warning'}">
                ${s.status === 'ONLINE' ? 'Optimal' : 'Elevated'}
              </span>
            </div>
            <div class="station-telemetry-row">
              <span>Voltage Class</span>
              <strong>${s.voltage}</strong>
            </div>
            <div class="station-telemetry-row">
              <span>Top Oil Temp</span>
              <strong style="${s.oilTemp > 80 ? 'color: #F87171;' : ''}">${s.oilTemp}°C</strong>
            </div>
            <div class="station-telemetry-row">
              <span>Feeder Load</span>
              <strong>${s.loadPct}%</strong>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // TAB 2: Suggestions Tab
  renderSuggestionsTab() {
    return `
      <div class="screen-header-block">
        <h1 class="screen-title">AI Suggestions</h1>
        <p class="screen-subtitle">Predictive maintenance recommendations & dispatch priorities</p>
      </div>

      <div class="suggestions-list">
        ${this.suggestions.map(s => `
          <div class="suggestion-card">
            <div class="sug-header">
              <div>
                <div class="sug-title">${s.title}</div>
                <div class="sug-substation">${s.substation}</div>
              </div>
              <span class="sug-urgency-badge ${s.urgency.toLowerCase()}">${s.urgency}</span>
            </div>
            <p class="sug-desc">${s.summary}</p>
            <div class="sug-actions">
              <button type="button" class="btn-sug-action" data-action="${s.actionLabel}" data-sub="${s.substation}">
                ⚡ ${s.actionLabel}
              </button>
              <button type="button" class="btn-sug-secondary" data-sub="${s.substation}">
                Dismiss
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents() {
    // 1. Bottom Tab Navigation (Dashboard, Suggestions, History)
    document.querySelectorAll('.bottom-tab-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.activeTab = tab;

        // Update active class
        document.querySelectorAll('.bottom-tab-item').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update brand bar label
        const brandLabel = document.getElementById('brand-active-label');
        if (brandLabel) brandLabel.textContent = this.getSectionLabel();

        // Update content area
        const contentArea = document.getElementById('mobile-content-area');
        if (contentArea) {
          contentArea.innerHTML = this.renderActiveTabContent();
          this.bindContentEvents();
        }
      });
    });

    // 2. View Mode Toggle (Phone Frame vs Wide View)
    const toggleBtn = document.getElementById('view-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        if (e.target.id === 'portal-jump-btn') {
          // Jump to full desktop portal
          const targetUrl = window.router.getAuthorizedRedirectUrl(window.auth.user) || '/admin';
          if (targetUrl === '/mobile') {
            window.router.navigate('/substation/field-engineer');
          } else {
            window.router.navigate(targetUrl);
          }
          return;
        }

        this.isFrameMode = !this.isFrameMode;
        const deviceBox = document.getElementById('phone-device-box');
        if (deviceBox) {
          deviceBox.classList.toggle('device-framed', this.isFrameMode);
        }
      });
    }

    // 3. Mobile Back / Exit button
    const backBtn = document.getElementById('mobile-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (confirm('Log out from GridWatch mobile session?')) {
          window.auth.logout();
        }
      });
    }

    // 4. Notifications button
    const notifsBtn = document.getElementById('mobile-notifs-btn');
    if (notifsBtn) {
      notifsBtn.addEventListener('click', () => {
        window.toast.info('GridWatch Telemetry', '3 historical detections logged in the last 48 hours.');
      });
    }

    // 5. Share status button
    const shareBtn = document.getElementById('mobile-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(window.location.href);
        window.toast.success('Telemetry Link Copied', 'GridWatch dispatch link copied to clipboard.');
      });
    }

    // 6. User profile menu
    const userMenuBtn = document.getElementById('mobile-user-menu-btn');
    if (userMenuBtn) {
      userMenuBtn.addEventListener('click', () => {
        const user = window.auth.user || {};
        const choice = confirm(`Logged in as: ${user.full_name || 'Operator'}\nRole: ${user.role || 'substation_team'}\n\nClick OK to log out, or Cancel to stay.`);
        if (choice) {
          window.auth.logout();
        }
      });
    }

    // 7. Bind content interactions
    this.bindContentEvents();
  }

  bindContentEvents() {
    // Click on alert history card opens bottom sheet inspection
    document.querySelectorAll('.alert-history-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id, 10);
        const alert = this.alerts.find(a => a.id === id);
        if (alert) {
          this.openAlertDetailSheet(alert);
        }
      });
    });

    // Suggestions action buttons
    document.querySelectorAll('.btn-sug-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const sub = e.currentTarget.dataset.sub;
        window.toast.success('Action Dispatched', `${action} protocol initiated for ${sub}. SCADA bus notified.`);
      });
    });
  }

  openAlertDetailSheet(alert) {
    const modal = document.getElementById('alert-detail-modal');
    const sheet = document.getElementById('alert-detail-sheet');
    if (!modal || !sheet) return;

    sheet.innerHTML = `
      <div class="sheet-handle-bar"></div>
      <div class="sheet-header-row">
        <div>
          <div class="sheet-title">${alert.substation_name}</div>
          <span style="font-size: 12px; color: var(--phone-teal);">Incident Ref: GW-DET-${alert.id}04</span>
        </div>
        <button type="button" class="sheet-close-btn" id="close-detail-sheet">&times;</button>
      </div>

      <div class="sheet-info-table">
        <div class="sheet-info-row">
          <span class="label">Status</span>
          <span class="val" style="color: var(--phone-teal);">${alert.status}</span>
        </div>
        <div class="sheet-info-row">
          <span class="label">Logged Timestamp</span>
          <span class="val">${alert.timestamp_label}</span>
        </div>
        <div class="sheet-info-row">
          <span class="label">Detection Telemetry</span>
          <span class="val">${alert.metric_type || 'Oil Temperature'}: ${alert.metric_value || '89°C'}</span>
        </div>
        <div class="sheet-info-row">
          <span class="label">Acknowledged By</span>
          <span class="val">${alert.acknowledged_by || 'R. Verma'}</span>
        </div>
        <div class="sheet-info-row">
          <span class="label">Response Interval</span>
          <span class="val">${alert.response_time_min || 4} minutes</span>
        </div>
        <div class="sheet-info-row">
          <span class="label">Monitored Transformer</span>
          <span class="val">${alert.transformer_id || 'TX-02 (500/230kV)'}</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn-sug-action" id="sheet-verify-btn" style="flex: 1;">
          ✓ Confirm SCADA Verification
        </button>
        <button type="button" class="btn-sug-secondary" id="sheet-close-btn2">
          Close
        </button>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('close-detail-sheet')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    document.getElementById('sheet-close-btn2')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    document.getElementById('sheet-verify-btn')?.addEventListener('click', () => {
      window.toast.success('SCADA Log Updated', `Incident ${alert.substation_name} confirmed.`);
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

window.MobileView = MobileView;
