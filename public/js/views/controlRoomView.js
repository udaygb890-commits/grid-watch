// GridWatch Control Room Dashboard View

class ControlRoomView {
  constructor() {
    this.telemetry = null;
  }

  async render(container) {
    container.innerHTML = `
      <!-- Navigation Bar -->
      <nav class="dashboard-navbar">
        <div class="nav-left">
          <img src="/assets/logo.svg" alt="GridWatch Logo" class="nav-logo" id="nav-brand-logo" />
          <div class="nav-divider"></div>
          <div class="nav-portal-title">
            <span class="nav-portal-name">
              <span class="status-beacon online"></span>
              Central Control Room & Grid Dispatch Telemetry
            </span>
            <span class="nav-substation-indicator">Interconnected Transmission Network</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-identity-card">
            <div class="user-avatar-badge" style="background: linear-gradient(135deg, #00C6FF, #0072FF);">⚡</div>
            <div class="user-info-text">
              <span class="user-display-name">${window.auth.user ? window.auth.user.full_name : 'Control Room Operator'}</span>
              <span class="user-role-badge">CONTROL ROOM &bull; DISPATCH COMMAND</span>
            </div>
          </div>
          <button type="button" class="btn-logout" id="btn-cr-logout" title="Terminate Session">
            <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <!-- Viewport -->
      <div class="dashboard-viewport">
        <!-- AI Anomaly Alert Banner (Prominent AI Predictive Maintenance) -->
        <div class="anomaly-banner" id="cr-critical-banner">
          <div class="anomaly-banner-content">
            <div class="anomaly-icon-box">⚠️</div>
            <div class="anomaly-details">
              <h4>CRITICAL ANOMALY DETECTED: TX-CASCADE-402 (500/230kV)</h4>
              <p>
                <strong>AI Predictive Model (Confidence 94.8%):</strong> Rapid Dissolved Gas Evolution (H2: 245.8 ppm, +182 ppm/24h) and winding hotspot risk.
              </p>
            </div>
          </div>
          <button type="button" class="btn-primary" id="btn-dispatch-emergency" style="background: linear-gradient(135deg, #FF3B30, #D32F2F);">
            ⚡ Instant Dispatch Substation Field Engineer
          </button>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-card-label">Grid Frequency</div>
            <div class="metric-card-value" style="color: var(--cyan-neon);">60.02 <span style="font-size: 16px;">Hz</span></div>
            <div class="metric-card-hint">Nominal transmission equilibrium</div>
          </div>
          <div class="metric-card">
            <div class="metric-card-label">Monitored Fleet Capacity</div>
            <div class="metric-card-value" id="cr-mva-capacity">1,150 <span style="font-size: 16px;">MVA</span></div>
            <div class="metric-card-hint">Step-up & step-down transformers</div>
          </div>
          <div class="metric-card success">
            <div class="metric-card-label">Fleet Health Index</div>
            <div class="metric-card-value" id="cr-fleet-health">85%</div>
            <div class="metric-card-hint">AI weighted transformer diagnostics</div>
          </div>
          <div class="metric-card critical">
            <div class="metric-card-label">Active Anomalies</div>
            <div class="metric-card-value" id="cr-anomalies-count" style="color: var(--status-critical);">2</div>
            <div class="metric-card-hint">1 Critical &bull; 1 Elevated warning</div>
          </div>
        </div>

        <!-- High-Voltage Transformer Fleet Telemetry Table -->
        <div class="table-container">
          <div class="table-header-bar">
            <div class="table-header-title">
              <span>⚡</span> Transformer Fleet Real-Time AI Telemetry
            </div>
            <span class="metric-pill cyan">Continuous Sensor Telemetry</span>
          </div>
          <div class="table-scroll">
            <table class="gridwatch-table">
              <thead>
                <tr>
                  <th>Transformer & Substation</th>
                  <th>Health Score</th>
                  <th>MVA & Load</th>
                  <th>Oil / Winding Temp</th>
                  <th>DGA Status (H2 ppm)</th>
                  <th>Breaker Status</th>
                  <th>AI Anomaly Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="cr-transformers-table-body">
                <tr><td colspan="8" style="text-align: center; padding: 24px;">Loading fleet telemetry...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Active Dispatches & Work Orders -->
        <div class="table-container">
          <div class="table-header-bar">
            <div class="table-header-title">
              <span>📋</span> Active Substation Team Dispatches
            </div>
            <span class="metric-pill success">Live Maintenance Stream</span>
          </div>
          <div class="table-scroll">
            <table class="gridwatch-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Substation & Transformer</th>
                  <th>Assigned Field Engineer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>AI Recommendation</th>
                </tr>
              </thead>
              <tbody id="cr-workorders-table-body">
                <tr><td colspan="6" style="text-align: center; padding: 24px;">Loading active dispatches...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Dispatch Field Engineer Modal -->
      <div id="dispatch-modal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">⚡ Dispatch Field Engineer to Substation</h3>
            <button type="button" class="modal-close-btn" id="close-dispatch-modal">&times;</button>
          </div>
          <form id="dispatch-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="dispatch-tx-select">Target Transformer</label>
                <select id="dispatch-tx-select" class="form-input" style="padding-left: 14px;" required></select>
              </div>
              <div class="form-group">
                <label class="form-label" for="dispatch-engineer-select">Assign Field Engineer (Substation Team)</label>
                <select id="dispatch-engineer-select" class="form-input" style="padding-left: 14px;" required></select>
              </div>
              <div class="form-group">
                <label class="form-label" for="dispatch-priority">Priority Level</label>
                <select id="dispatch-priority" class="form-input" style="padding-left: 14px;">
                  <option value="CRITICAL">CRITICAL - Immediate Emergency Response</option>
                  <option value="HIGH" selected>HIGH - Urgent Inspection</option>
                  <option value="MEDIUM">MEDIUM - Standard Preventive</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="dispatch-title">Dispatch Title</label>
                <input type="text" id="dispatch-title" class="form-input" value="Emergency DGA & Thermal Scan Verification" required style="padding-left: 14px;" />
              </div>
              <div class="form-group">
                <label class="form-label" for="dispatch-instructions">Special Instructions</label>
                <textarea id="dispatch-instructions" class="form-input" rows="3" style="padding: 10px 14px; height: auto;">Perform ultrasonic partial discharge check and oil sample analysis before tap changer operation.</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" id="btn-cancel-dispatch">Cancel</button>
              <button type="submit" class="btn-primary" id="btn-submit-dispatch" style="background: linear-gradient(135deg, #00E5FF, #0072FF);">
                Confirm & Issue Dispatch Order
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(container);
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await window.api.get('/control-room/telemetry');
      this.telemetry = data;
      this.renderTelemetry();
    } catch (err) {
      window.toast.error('Telemetry Error', err.message || 'Failed to fetch control room telemetry.');
    }
  }

  renderTelemetry() {
    if (!this.telemetry) return;

    const { metrics, transformers, activeWorkOrders, fieldEngineers } = this.telemetry;

    // Metrics
    document.getElementById('cr-mva-capacity').innerHTML = `${metrics.totalMvaCapacity} <span style="font-size: 16px;">MVA</span>`;
    document.getElementById('cr-fleet-health').textContent = `${metrics.averageFleetHealthScore}%`;
    document.getElementById('cr-anomalies-count').textContent = metrics.criticalAnomalies;

    // Transformers Table
    const txBody = document.getElementById('cr-transformers-table-body');
    if (txBody) {
      txBody.innerHTML = transformers.map(tx => {
        let healthClass = 'high';
        if (tx.health_score < 70) healthClass = 'low';
        else if (tx.health_score < 90) healthClass = 'medium';

        let dgaPill = `<span class="metric-pill success">NORMAL (${tx.hydrogen_ppm} ppm)</span>`;
        if (tx.dga_status === 'CRITICAL') {
          dgaPill = `<span class="metric-pill critical">CRITICAL (${tx.hydrogen_ppm} ppm)</span>`;
        } else if (tx.dga_status === 'ELEVATED') {
          dgaPill = `<span class="metric-pill warning">ELEVATED (${tx.hydrogen_ppm} ppm)</span>`;
        }

        return `
          <tr>
            <td>
              <strong>${tx.name}</strong>
              <div style="font-size: 11.5px; color: var(--cyan-bright);">${tx.substation_name}</div>
            </td>
            <td>
              <div class="health-bar-container">
                <div class="health-bar-fill ${healthClass}" style="width: ${tx.health_score}%;"></div>
              </div>
              <strong style="font-family: var(--font-mono);">${tx.health_score}%</strong>
            </td>
            <td style="font-family: var(--font-mono); font-size: 12.5px;">
              ${tx.mva_rating} MVA &bull; <span style="color: ${tx.load_pct > 80 ? 'var(--status-critical)' : 'inherit'}">${tx.load_pct}% load</span>
            </td>
            <td style="font-family: var(--font-mono); font-size: 12.5px;">
              Oil: ${tx.oil_temp_c}°C &bull; Winding: ${tx.winding_temp_c}°C
            </td>
            <td>${dgaPill}</td>
            <td>
              <span class="metric-pill ${tx.breaker_status === 'CLOSED' ? 'success' : 'critical'}">
                ${tx.breaker_status}
              </span>
            </td>
            <td>
              ${tx.anomaly_detected === 1 
                ? `<span class="metric-pill critical" title="${tx.anomaly_type}">⚠️ Anomaly (${tx.anomaly_confidence}%)</span>` 
                : '<span class="metric-pill success">Nominal</span>'}
            </td>
            <td>
              <button class="btn-action-small btn-dispatch-tx" data-txid="${tx.id}" style="color: var(--cyan-neon);">
                Dispatch FE
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Work Orders Table
    const woBody = document.getElementById('cr-workorders-table-body');
    if (woBody) {
      if (!activeWorkOrders.length) {
        woBody.innerHTML = '<tr><td colspan="6" class="empty-state">No open dispatches. Fleet operating nominally.</td></tr>';
      } else {
        woBody.innerHTML = activeWorkOrders.map(wo => `
          <tr>
            <td style="font-family: var(--font-mono); font-size: 11.5px; color: var(--cyan-neon);">${wo.ticket_number}</td>
            <td>
              <strong>${wo.transformer_name}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${wo.substation_name}</div>
            </td>
            <td>
              <strong>${wo.assigned_engineer_name || 'Unassigned'}</strong>
              <div style="font-size: 11px; color: var(--cyan-bright);">Substation Team &bull; Field Engineer</div>
            </td>
            <td>
              <span class="metric-pill ${wo.priority === 'CRITICAL' ? 'critical' : (wo.priority === 'HIGH' ? 'warning' : 'cyan')}">
                ${wo.priority}
              </span>
            </td>
            <td>
              <span class="metric-pill cyan">${wo.status}</span>
            </td>
            <td style="font-size: 12px; color: var(--text-secondary); max-width: 280px;">${wo.ai_recommendation || 'Standard diagnostic inspection'}</td>
          </tr>
        `).join('');
      }
    }

    // Populate dispatch dropdowns
    const txSelect = document.getElementById('dispatch-tx-select');
    if (txSelect) {
      txSelect.innerHTML = transformers.map(tx => `<option value="${tx.id}">${tx.name} (${tx.substation_name})</option>`).join('');
    }

    const engSelect = document.getElementById('dispatch-engineer-select');
    if (engSelect) {
      engSelect.innerHTML = fieldEngineers.map(eng => `<option value="${eng.id}">${eng.full_name} (${eng.badge_id || eng.username})</option>`).join('');
    }
  }

  bindEvents(container) {
    document.getElementById('btn-cr-logout').addEventListener('click', () => {
      window.auth.logout();
    });

    const modal = document.getElementById('dispatch-modal');
    const openBtn = document.getElementById('btn-dispatch-emergency');
    const closeBtn = document.getElementById('close-dispatch-modal');
    const cancelBtn = document.getElementById('btn-cancel-dispatch');

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Dispatch buttons in table
    const txBody = document.getElementById('cr-transformers-table-body');
    txBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-dispatch-tx');
      if (btn) {
        const txId = btn.dataset.txid;
        const txSelect = document.getElementById('dispatch-tx-select');
        if (txSelect) txSelect.value = txId;
        openModal();
      }
    });

    // Form submit
    const form = document.getElementById('dispatch-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const transformerId = document.getElementById('dispatch-tx-select').value;
      const engineerId = document.getElementById('dispatch-engineer-select').value;
      const priority = document.getElementById('dispatch-priority').value;
      const title = document.getElementById('dispatch-title').value.trim();
      const instructions = document.getElementById('dispatch-instructions').value.trim();

      const submitBtn = document.getElementById('btn-submit-dispatch');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Issuing Dispatch...';

      try {
        const res = await window.api.post('/control-room/dispatch', {
          transformerId,
          engineerId,
          priority,
          title,
          instructions
        });

        window.toast.success('Field Engineer Dispatched', res.message);
        closeModal();
        this.loadData();
      } catch (err) {
        window.toast.error('Dispatch Failed', err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm & Issue Dispatch Order';
      }
    });
  }
}

window.ControlRoomView = ControlRoomView;
