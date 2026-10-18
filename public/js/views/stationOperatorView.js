// GridWatch Substation Team - Station Operator Console View

class StationOperatorView {
  constructor() {
    this.data = null;
  }

  async render(container) {
    const user = window.auth.user || {};
    const substationName = user.substation_name || 'Cascade North Substation 11A';

    container.innerHTML = `
      <!-- Navigation Bar -->
      <nav class="dashboard-navbar">
        <div class="nav-left">
          <img src="/assets/logo.svg" alt="GridWatch Logo" class="nav-logo" id="nav-brand-logo" />
          <div class="nav-divider"></div>
          <div class="nav-portal-title">
            <span class="nav-portal-name">
              <span class="status-beacon online"></span>
              Substation Team &bull; Station Operator Diagnostics Console
            </span>
            <span class="nav-substation-indicator">📍 ${substationName}</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-identity-card">
            <div class="user-avatar-badge" style="background: linear-gradient(135deg, #00E676, #0088FF);">🏭</div>
            <div class="user-info-text">
              <span class="user-display-name">${user.full_name || 'Sarah Chen'}</span>
              <span class="user-role-badge">SUBSTATION TEAM &bull; STATION OPERATOR</span>
            </div>
          </div>
          <button type="button" class="btn-logout" id="btn-operator-logout" title="Terminate Session">
            <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <!-- Viewport -->
      <div class="dashboard-viewport">
        <!-- Substation Local Status Header -->
        <div class="dashboard-header">
          <div class="dashboard-title-group">
            <h1><span>🏭</span> Local Transformer Bays & Diagnostics</h1>
            <div class="dashboard-subtitle">
              On-site SCADA telemetry, dissolved gas monitoring, and circuit breaker trip/close supervisory control.
            </div>
          </div>
          <div>
            <span class="metric-pill cyan">Badge: ${user.badge_id || 'GW-SO-209'}</span>
            <span class="metric-pill success" style="margin-left: 6px;">SCADA Bus Online</span>
          </div>
        </div>

        <!-- Transformer Bays Grid -->
        <div id="operator-transformers-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading local transformer telemetry...</div>
        </div>

        <!-- Station Work Orders & Maintenance Status -->
        <div class="table-container">
          <div class="table-header-bar">
            <div class="table-header-title">
              <span>🔧</span> On-Site Work Orders & Field Engineer Coordination
            </div>
            <span class="metric-pill cyan">Substation Maintenance Feed</span>
          </div>
          <div class="table-scroll">
            <table class="gridwatch-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Assigned Field Engineer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody id="operator-workorders-body">
                <tr><td colspan="6" style="text-align: center; padding: 24px;">Loading local work orders...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await window.api.get('/substation/operator/telemetry');
      this.data = data;
      this.renderBays();
    } catch (err) {
      window.toast.error('Data Fetch Error', err.message || 'Failed to load substation telemetry.');
    }
  }

  renderBays() {
    const container = document.getElementById('operator-transformers-container');
    const woBody = document.getElementById('operator-workorders-body');
    if (!container || !this.data) return;

    const { transformers, workOrders } = this.data;

    container.innerHTML = transformers.map(tx => {
      const isCritical = tx.anomaly_detected === 1 || tx.dga_status === 'CRITICAL';
      const isBreakerClosed = tx.breaker_status === 'CLOSED';

      return `
        <div class="cyber-panel" style="padding: 22px; ${isCritical ? 'border-color: rgba(255, 51, 75, 0.4); box-shadow: 0 0 20px rgba(255, 51, 75, 0.15);' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">${tx.name}</h3>
              <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-muted);">
                Serial: ${tx.serial_number} &bull; Rating: ${tx.mva_rating} MVA
              </div>
            </div>
            <span class="metric-pill ${tx.health_score < 70 ? 'critical' : 'success'}">
              Health: ${tx.health_score}%
            </span>
          </div>

          ${isCritical ? `
            <div class="login-alert error" style="margin-bottom: 14px; font-size: 12px; padding: 8px 12px;">
              <span>⚠️</span>
              <div>
                <strong>AI Anomaly:</strong> ${tx.anomaly_type} (Confidence: ${tx.anomaly_confidence}%)
              </div>
            </div>
          ` : ''}

          <!-- Live Gauges & Values -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Oil Temperature</div>
              <div style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: ${tx.oil_temp_c > 75 ? 'var(--status-critical)' : 'var(--text-primary)'};">
                ${tx.oil_temp_c}°C
              </div>
              <div style="font-size: 10.5px; color: var(--text-secondary);">Winding: ${tx.winding_temp_c}°C</div>
            </div>

            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Dissolved H2 Gas</div>
              <div style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: ${tx.hydrogen_ppm > 100 ? 'var(--status-critical)' : 'var(--cyan-neon)'};">
                ${tx.hydrogen_ppm} <span style="font-size: 13px;">ppm</span>
              </div>
              <div style="font-size: 10.5px; color: var(--text-secondary);">Acetylene: ${tx.acetylene_ppm} ppm</div>
            </div>
          </div>

          <!-- Circuit Breaker Supervisory Control -->
          <div style="background: rgba(14, 23, 41, 0.7); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12.5px; font-weight: 600;">Circuit Breaker Status:</span>
              <span class="metric-pill ${isBreakerClosed ? 'success' : 'critical'}">
                ● ${tx.breaker_status}
              </span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn-action-small btn-toggle-breaker" data-txid="${tx.id}" data-status="CLOSED" ${isBreakerClosed ? 'disabled' : ''} style="flex: 1; height: 32px; background: rgba(0, 230, 118, 0.15); color: #00E676; border-color: rgba(0, 230, 118, 0.3);">
                Close Breaker (Energize)
              </button>
              <button type="button" class="btn-action-small btn-toggle-breaker" data-txid="${tx.id}" data-status="OPEN" ${!isBreakerClosed ? 'disabled' : ''} style="flex: 1; height: 32px; background: rgba(255, 51, 75, 0.15); color: #FFA5B0; border-color: rgba(255, 51, 75, 0.3);">
                Trip Breaker (Isolate)
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Work Orders
    if (woBody) {
      if (!workOrders.length) {
        woBody.innerHTML = '<tr><td colspan="6" class="empty-state">No open maintenance tickets for this station.</td></tr>';
      } else {
        woBody.innerHTML = workOrders.map(wo => `
          <tr>
            <td style="font-family: var(--font-mono); color: var(--cyan-bright); font-size: 12px;">${wo.ticket_number}</td>
            <td><strong>${wo.title}</strong></td>
            <td>${wo.engineer_name || 'Unassigned'}</td>
            <td><span class="metric-pill ${wo.priority === 'CRITICAL' ? 'critical' : 'warning'}">${wo.priority}</span></td>
            <td><span class="metric-pill cyan">${wo.status}</span></td>
            <td style="font-size: 11.5px; color: var(--text-muted);">${new Date(wo.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    }
  }

  bindEvents(container) {
    document.getElementById('btn-operator-logout').addEventListener('click', () => {
      window.auth.logout();
    });

    const txContainer = document.getElementById('operator-transformers-container');
    txContainer.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-toggle-breaker');
      if (btn && !btn.disabled) {
        const txId = btn.dataset.txid;
        const newStatus = btn.dataset.status;

        btn.disabled = true;
        try {
          const res = await window.api.post('/substation/operator/toggle-breaker', {
            transformerId: txId,
            newStatus
          });
          window.toast.success('Breaker State Changed', res.message);
          this.loadData();
        } catch (err) {
          window.toast.error('Breaker Control Error', err.message);
          btn.disabled = false;
        }
      }
    });
  }
}

window.StationOperatorView = StationOperatorView;
