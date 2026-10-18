// GridWatch Substation Team - Field Engineer Mobile/Tablet-Optimized View

class FieldEngineerView {
  constructor() {
    this.data = null;
    this.selectedOrderId = null;
  }

  async render(container) {
    const user = window.auth.user || {};

    container.innerHTML = `
      <!-- Navigation Bar -->
      <nav class="dashboard-navbar">
        <div class="nav-left">
          <img src="/assets/logo.svg" alt="GridWatch Logo" class="nav-logo" id="nav-brand-logo" />
          <div class="nav-divider"></div>
          <div class="nav-portal-title">
            <span class="nav-portal-name">
              <span class="status-beacon online"></span>
              Field Engineer Mobile Maintenance Terminal
            </span>
            <span class="nav-substation-indicator">📍 ${user.substation_name || 'Assigned Substation: Cascade North'}</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-identity-card">
            <div class="user-avatar-badge" style="background: linear-gradient(135deg, #FFB300, #FF6F00);">🔧</div>
            <div class="user-info-text">
              <span class="user-display-name">${user.full_name || 'Devon Reed'}</span>
              <span class="user-role-badge">SUBSTATION TEAM &bull; FIELD ENGINEER</span>
            </div>
          </div>
          <button type="button" class="btn-logout" id="btn-fe-logout" title="Terminate Session">
            <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <!-- Viewport -->
      <div class="dashboard-viewport">
        <div class="dashboard-header">
          <div class="dashboard-title-group">
            <h1><span>🛠️</span> Assigned Transformer Diagnostic Work Orders</h1>
            <div class="dashboard-subtitle">
              Field inspection protocol, sensor calibration, real-time checklist verification, and status resolution.
            </div>
          </div>
          <div>
            <span class="metric-pill cyan">Badge: ${user.badge_id || 'GW-FE-412'}</span>
            <span class="metric-pill warning" style="margin-left: 6px;">Field Mode Active</span>
          </div>
        </div>

        <!-- Work Orders List Grid -->
        <div class="work-orders-grid" id="fe-orders-container">
          <div style="text-align: center; padding: 40px; color: var(--text-muted); grid-column: 1/-1;">
            Loading assigned maintenance tickets...
          </div>
        </div>

        <!-- Selected Work Order Detailed Protocol Workspace -->
        <div id="fe-order-detail-panel" style="display: none;" class="cyber-panel">
          <!-- Populated dynamically when a work order is selected -->
        </div>
      </div>
    `;

    this.bindEvents(container);
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await window.api.get('/substation/field-engineer/work-orders');
      this.data = data;
      this.renderOrders();
    } catch (err) {
      window.toast.error('Load Error', err.message || 'Failed to load field engineer orders.');
    }
  }

  renderOrders() {
    const container = document.getElementById('fe-orders-container');
    if (!container || !this.data) return;

    const orders = this.data.workOrders || [];
    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">✅</div>
          <div class="empty-state-title">No Pending Dispatches</div>
          <div class="empty-state-text">All assigned transformers are operating nominally.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(wo => {
      const isCritical = wo.priority === 'CRITICAL';
      const checklist = wo.diagnostic_checklist || [];
      const completedSteps = checklist.filter(s => s.completed).length;
      const totalSteps = checklist.length;

      return `
        <div class="work-order-card ${isCritical ? 'critical' : ''}" data-id="${wo.id}">
          <div class="work-order-header">
            <div>
              <span class="ticket-tag">${wo.ticket_number}</span>
              <h3 style="font-size: 16px; margin: 4px 0 2px 0;">${wo.title}</h3>
              <div style="font-size: 12px; color: var(--text-muted);">${wo.substation_name} &bull; ${wo.transformer_name}</div>
            </div>
            <span class="metric-pill ${isCritical ? 'critical' : 'warning'}">${wo.priority}</span>
          </div>

          <div style="font-size: 12.5px; color: var(--cyan-bright); background: rgba(0, 240, 255, 0.05); padding: 8px 10px; border-radius: var(--radius-sm); border-left: 3px solid var(--cyan-neon);">
            <strong>AI Recommendation:</strong> ${wo.ai_recommendation || 'Verify telemetry and sensors.'}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 4px;">
            <span style="color: var(--text-secondary);">
              Protocol Checklist: <strong>${completedSteps}/${totalSteps} complete</strong>
            </span>
            <span class="metric-pill cyan">${wo.status}</span>
          </div>

          <button type="button" class="btn-primary btn-inspect-order" data-id="${wo.id}" style="margin-top: 8px; width: 100%; justify-content: center; height: 38px;">
            🔍 Open Diagnostic Protocol Workspace
          </button>
        </div>
      `;
    }).join('');

    // If an order is selected, re-render its details
    if (this.selectedOrderId) {
      this.renderDetailPanel(this.selectedOrderId);
    } else if (orders.length > 0) {
      // Auto-open first order
      this.renderDetailPanel(orders[0].id);
    }
  }

  renderDetailPanel(orderId) {
    this.selectedOrderId = orderId;
    const panel = document.getElementById('fe-order-detail-panel');
    if (!panel || !this.data) return;

    const order = this.data.workOrders.find(o => o.id === parseInt(orderId, 10));
    if (!order) return;

    panel.style.display = 'block';
    const checklist = order.diagnostic_checklist || [];

    panel.innerHTML = `
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
          <div>
            <div style="font-family: var(--font-mono); color: var(--cyan-neon); font-size: 13px;">${order.ticket_number} &bull; ${order.substation_name}</div>
            <h2 style="font-size: 22px; margin: 4px 0 6px 0;">${order.title}</h2>
            <div style="font-size: 13px; color: var(--text-secondary);">
              Target: <strong>${order.transformer_name}</strong> (Oil: ${order.oil_temp_c}°C &bull; H2: ${order.hydrogen_ppm} ppm)
            </div>
          </div>

          <!-- Status Transition Control -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12.5px; font-weight: 600;">Work Order Status:</span>
            <select id="fe-status-selector" class="form-input" style="width: 170px; height: 38px; padding-left: 10px;">
              <option value="ASSIGNED" ${order.status === 'ASSIGNED' ? 'selected' : ''}>ASSIGNED</option>
              <option value="ACKNOWLEDGED" ${order.status === 'ACKNOWLEDGED' ? 'selected' : ''}>ACKNOWLEDGED</option>
              <option value="ON_SITE" ${order.status === 'ON_SITE' ? 'selected' : ''}>ON SITE</option>
              <option value="INSPECTING" ${order.status === 'INSPECTING' ? 'selected' : ''}>INSPECTING</option>
              <option value="RESOLVED" ${order.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED (Clear Anomaly)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
          <!-- Left: Diagnostic Protocol Checklist -->
          <div>
            <h4 style="font-size: 15px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>✅</span> Step-by-Step Field Diagnostic Protocol
            </h4>
            <div class="wo-checklist" id="fe-checklist-container">
              ${checklist.map(step => `
                <label class="checklist-item ${step.completed ? 'completed' : ''}">
                  <input type="checkbox" class="step-checkbox" data-orderid="${order.id}" data-stepid="${step.id}" ${step.completed ? 'checked' : ''} />
                  <span>${step.text}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Right: Field Notes & Findings -->
          <div>
            <h4 style="font-size: 15px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <span>📝</span> Engineer Field Notes & Anomaly Verification Log
            </h4>
            <textarea id="fe-notes-input" class="form-input" rows="5" style="height: auto; padding: 12px; margin-bottom: 12px;" placeholder="Add field observation or test measurement findings..."></textarea>
            <div style="display: flex; justify-content: flex-end;">
              <button type="button" class="btn-primary" id="btn-save-notes">
                Save Field Notes & Update Status
              </button>
            </div>
            
            <div style="margin-top: 14px; font-size: 12px; color: var(--text-muted); background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); max-height: 120px; overflow-y: auto;">
              <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-secondary);">Previous Field Log:</div>
              <pre style="font-family: inherit; white-space: pre-wrap;">${order.field_notes || 'No previous log entries.'}</pre>
            </div>
          </div>
        </div>
      </div>
    `;

    panel.scrollIntoView({ behavior: 'smooth' });
    this.bindDetailEvents(panel, order.id);
  }

  bindDetailEvents(panel, orderId) {
    // Checkbox toggles
    panel.querySelectorAll('.step-checkbox').forEach(cb => {
      cb.addEventListener('change', async () => {
        const stepId = cb.dataset.stepid;
        const completed = cb.checked;

        try {
          await window.api.put(`/substation/field-engineer/work-orders/${orderId}/step`, {
            stepId,
            completed
          });
          window.toast.success('Step Recorded', completed ? 'Diagnostic step verified.' : 'Step marked incomplete.');
          await this.loadData();
        } catch (err) {
          window.toast.error('Checklist Error', err.message);
          cb.checked = !completed;
        }
      });
    });

    // Status & Notes Save
    const saveBtn = document.getElementById('btn-save-notes');
    const statusSelect = document.getElementById('fe-status-selector');
    const notesInput = document.getElementById('fe-notes-input');

    saveBtn.addEventListener('click', async () => {
      const status = statusSelect.value;
      const fieldNotes = notesInput.value.trim();

      saveBtn.disabled = true;
      saveBtn.textContent = 'Updating...';

      try {
        const res = await window.api.put(`/substation/field-engineer/work-orders/${orderId}/status`, {
          status,
          fieldNotes
        });

        window.toast.success('Work Order Updated', res.message);
        if (status === 'RESOLVED') {
          window.toast.success('Anomaly Cleared', 'Transformer status restored to nominal health (95%).');
        }
        await this.loadData();
      } catch (err) {
        window.toast.error('Update Failed', err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Field Notes & Update Status';
      }
    });
  }

  bindEvents(container) {
    document.getElementById('btn-fe-logout').addEventListener('click', () => {
      window.auth.logout();
    });

    const ordersGrid = document.getElementById('fe-orders-container');
    ordersGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-inspect-order');
      if (btn) {
        const orderId = btn.dataset.id;
        this.renderDetailPanel(orderId);
      }
    });
  }
}

window.FieldEngineerView = FieldEngineerView;
