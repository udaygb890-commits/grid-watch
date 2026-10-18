// GridWatch Admin Dashboard View
// Implements 7-Transformer Network Map, Anomaly Alert List, Cascading Status Logs,
// and Field Engineer Deployment based directly on user handwritten architecture diagrams.

class AdminView {
  constructor() {
    this.transformers = [];
    this.anomalies = [];
    this.cascadingLogs = [];
    this.deployment = null;
    this.activeAnomalyFilter = 'all'; // 'all' | 'active' | 'resolved'
    this.selectedTransformer = null;
    this.selectedAnomaly = null;
  }

  async render(container) {
    this.container = container;
    await this.fetchData();

    container.innerHTML = `
      <!-- Top Navigation Bar -->
      <nav class="dashboard-navbar">
        <div class="nav-left">
          <div style="cursor: pointer;" id="admin-logo-home" title="GridWatch Home">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 0.8px;">
              <span style="color: #E6EDF3;">GRID</span><span style="color: #E5A93C;">WATCH</span>
            </span>
          </div>
          <div class="nav-divider"></div>
          <div class="nav-portal-title">
            <span class="nav-portal-name">
              <span class="status-beacon online"></span>
              Administrative Fleet Governance & Anomaly Command
            </span>
            <span class="nav-substation-indicator">Central SCADA Network &bull; 7 Monitored Transformers</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-identity-card">
            <div class="user-avatar-badge" style="background: linear-gradient(135deg, #F59E0B, #D97706);">👑</div>
            <div class="user-info-text">
              <span class="user-display-name">${window.auth.user ? window.auth.user.full_name : 'Elena Rostova'}</span>
              <span class="user-role-badge">ADMIN &bull; FULL NETWORK COMMAND</span>
            </div>
          </div>
          <button type="button" class="btn-logout" id="btn-admin-logout" title="Terminate Session">
            <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <!-- Viewport -->
      <div class="dashboard-viewport">

        <!-- Architecture Hierarchy Banner (Handwritten Page 04) -->
        <div class="admin-architecture-banner">
          <div class="arch-levels">
            <span class="arch-badge">
              <span>🏛️</span>
              <strong>Admin:</strong> Whole network of 7 transformers
            </span>
            <span class="arch-arrow">➔</span>
            <span class="arch-badge">
              <span>🎛️</span>
              <strong>Control units:</strong> Controls 2-3 set of transformers
            </span>
            <span class="arch-arrow">➔</span>
            <span class="arch-badge">
              <span>🏭</span>
              <strong>Substation:</strong> Controls 1 transformer bay
            </span>
            <span class="arch-arrow">➔</span>
            <span class="arch-badge">
              <span>🔧</span>
              <strong>Field engineer:</strong> Dispatched to inspect anomalies
            </span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11.5px; color: #38BDF8;">
            SCADA Bus Active &bull; Polling 1s
          </span>
        </div>

        <!-- ========================================================
             TOP ROW (Two Columns):
             Left: Anomaly Alert List (II)
             Right: Map of 7 Transformers (I)
             ======================================================== -->
        <div class="admin-grid-top">
          
          <!-- Top Left: Anomaly Alert List Panel (II) -->
          <div class="anomaly-panel">
            <div class="panel-header-row">
              <h2 class="panel-title">
                <span>⚠️</span> Anomaly Alert List
                <span class="unit-badge" id="anomaly-counter">${this.anomalies.length} alerts</span>
              </h2>
              <div class="panel-filter-tabs">
                <button type="button" class="filter-btn ${this.activeAnomalyFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                <button type="button" class="filter-btn ${this.activeAnomalyFilter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
                <button type="button" class="filter-btn ${this.activeAnomalyFilter === 'resolved' ? 'active' : ''}" data-filter="resolved">Resolved</button>
              </div>
            </div>

            <!-- List of Anomaly Cards -->
            <div class="anomaly-cards-scroll" id="anomaly-cards-container">
              ${this.renderAnomalyCards()}
            </div>
          </div>

          <!-- Top Right: Interactive Map of 7 Transformers (I) -->
          <div class="network-map-panel">
            <div class="panel-header-row">
              <h2 class="panel-title">
                <span>🗺️</span> Grid Transformer Network Map (7 Units)
              </h2>
              <span style="font-size: 12px; color: var(--text-muted);">
                Click any node for popup telemetry & waveforms
              </span>
            </div>

            <!-- SVG Map Canvas -->
            <div class="map-viewport-wrapper">
              <div class="map-hint-banner">
                ⚡ Click a node to view Location, GPS, Waveforms & DGA
              </div>

              <svg class="map-svg-canvas" viewBox="0 0 700 440" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <!-- Glow filter for lines and nodes -->
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="grid-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.7"/>
                    <stop offset="100%" stop-color="#0284C7" stop-opacity="0.4"/>
                  </linearGradient>
                </defs>

                <!-- Grid Background Lines -->
                <g stroke="#162232" stroke-width="1" opacity="0.6">
                  <line x1="50" y1="0" x2="50" y2="440" stroke-dasharray="4 4" />
                  <line x1="150" y1="0" x2="150" y2="440" stroke-dasharray="4 4" />
                  <line x1="250" y1="0" x2="250" y2="440" stroke-dasharray="4 4" />
                  <line x1="350" y1="0" x2="350" y2="440" stroke-dasharray="4 4" />
                  <line x1="450" y1="0" x2="450" y2="440" stroke-dasharray="4 4" />
                  <line x1="550" y1="0" x2="550" y2="440" stroke-dasharray="4 4" />
                  <line x1="650" y1="0" x2="650" y2="440" stroke-dasharray="4 4" />
                  <line x1="0" y1="80" x2="700" y2="80" stroke-dasharray="4 4" />
                  <line x1="0" y1="160" x2="700" y2="160" stroke-dasharray="4 4" />
                  <line x1="0" y1="240" x2="700" y2="240" stroke-dasharray="4 4" />
                  <line x1="0" y1="320" x2="700" y2="320" stroke-dasharray="4 4" />
                  <line x1="0" y1="400" x2="700" y2="400" stroke-dasharray="4 4" />
                </g>

                <!-- Transmission Lines Connecting the 7 Transformers -->
                <!-- T1(126,123) - T2(266,79) - T3(406,154) - T4(574,96) - T5(595,286) - T6(364,330) - T7(140,316) -->
                <g stroke="url(#grid-line-grad)" stroke-width="2.5" fill="none">
                  <line x1="126" y1="123" x2="266" y2="79" />
                  <line x1="266" y1="79" x2="406" y2="154" />
                  <line x1="406" y1="154" x2="574" y2="96" />
                  <line x1="574" y1="96" x2="595" y2="286" />
                  <line x1="595" y1="286" x2="364" y2="330" />
                  <line x1="364" y1="330" x2="140" y2="316" />
                  <line x1="140" y1="316" x2="126" y2="123" />
                  <!-- Cross transmission line T3 to T6 -->
                  <line x1="406" y1="154" x2="364" y2="330" stroke="#38BDF8" stroke-dasharray="6 4" opacity="0.6" />
                  <!-- Cross transmission line T2 to T7 -->
                  <line x1="266" y1="79" x2="140" y2="316" stroke="#38BDF8" stroke-dasharray="6 4" opacity="0.5" />
                </g>

                <!-- The 7 Transformer Nodes -->
                ${this.renderMapNodes()}
              </svg>

              <!-- Map Legend -->
              <div class="map-legend">
                <span><span class="legend-dot normal"></span> Normal</span>
                <span><span class="legend-dot warning"></span> Warning</span>
                <span><span class="legend-dot critical"></span> Critical Spike</span>
              </div>
            </div>
          </div>

        </div>

        <!-- ========================================================
             BOTTOM ROW:
             Cascading Status Logs (III) & Field Engineer Deployment
             ======================================================== -->
        <div class="admin-grid-bottom">
          
          <!-- Bottom Left: Cascading Status Logs (III) -->
          <div class="cascading-panel">
            <div class="panel-header-row">
              <h2 class="panel-title">
                <span>📋</span> (III) Cascading Status Log
              </h2>
              <span style="font-size: 12px; color: var(--text-muted);">
                Hierarchical Log of all 7 Transformers by Control Unit
              </span>
            </div>

            <!-- Cascading Tree -->
            <div class="cascading-tree">
              ${this.renderCascadingLogsTree()}
            </div>
          </div>

          <!-- Bottom Right: Field Engineer Deployment Status Panel (Page 04) -->
          <div class="deployment-panel">
            <div class="panel-header-row">
              <h2 class="panel-title">
                <span>🚚</span> Field Engineer Deployment Update
              </h2>
              <span class="anomaly-status-badge ${this.deployment.status === 'Resolved' ? 'resolved' : 'critical'}" id="deploy-status-badge">
                ${this.deployment.status === 'Resolved' ? '✓ Resolved' : '⚡ Not Done (In Progress)'}
              </span>
            </div>

            <div class="deployment-card">
              <div class="deployment-row">
                <span class="label">Assigned Field Engineer</span>
                <span class="val" style="color: #38BDF8;">${this.deployment.engineer}</span>
              </div>
              <div class="deployment-row">
                <span class="label">Headed to Location</span>
                <span class="val">${this.deployment.target}</span>
              </div>
              <div class="deployment-row">
                <span class="label">Dispatch Reason</span>
                <span class="val" style="color: #FF7B72;">${this.deployment.reason}</span>
              </div>
              <div class="deployment-row">
                <span class="label">Dispatched At</span>
                <span class="val">${this.deployment.deployedAt}</span>
              </div>
              <div class="deployment-row">
                <span class="label">Estimated Arrival</span>
                <span class="val">${this.deployment.eta}</span>
              </div>
              <div class="deployment-row">
                <span class="label">Diagnostic Toolkit</span>
                <span class="val" style="font-size: 11.5px;">${this.deployment.equipment}</span>
              </div>
            </div>

            <!-- Interactive Status Toggle Button (Handwritten Page 04) -->
            <button 
              type="button" 
              class="btn-resolve-toggle ${this.deployment.status === 'Resolved' ? 'reopen-action' : 'resolve-action'}" 
              id="btn-toggle-deployment"
            >
              ${this.deployment.status === 'Resolved' ? '↺ Reopen Anomaly (Mark Not Done)' : '✓ Mark Anomaly as Resolved'}
            </button>
          </div>

        </div>

      </div>

      <!-- ========================================================
           INTERACTIVE POPUP MODALS
           1. Transformer Details & Waveforms (Page 05 sketch)
           2. Anomaly Deep Diagnostic Comparison (Page 05 bottom)
           ======================================================== -->
      <div id="tx-details-modal" class="tx-modal-overlay" style="display: none;">
        <div class="tx-modal-dialog" id="tx-modal-content"></div>
      </div>

      <div id="anomaly-deep-modal" class="tx-modal-overlay" style="display: none;">
        <div class="tx-modal-dialog" id="anomaly-modal-content"></div>
      </div>
    `;

    this.bindEvents();
  }

  renderAnomalyCards() {
    let filtered = this.anomalies;
    if (this.activeAnomalyFilter === 'active') {
      filtered = this.anomalies.filter(a => a.status !== 'Resolved');
    } else if (this.activeAnomalyFilter === 'resolved') {
      filtered = this.anomalies.filter(a => a.status === 'Resolved');
    }

    if (filtered.length === 0) {
      return `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No anomalies found in this view.</div>`;
    }

    return filtered.map(a => `
      <div class="anomaly-item-card ${a.severity.toLowerCase()} ${a.status === 'Resolved' ? 'resolved' : ''}" data-anomaly-id="${a.id}">
        <div class="anomaly-card-head">
          <h4 class="anomaly-card-title">${a.title}</h4>
          <span class="anomaly-status-badge ${a.status === 'Resolved' ? 'resolved' : a.severity.toLowerCase()}">
            ${a.status === 'Resolved' ? '✓ Resolved' : a.status}
          </span>
        </div>
        <div class="anomaly-meta-row">
          <span>🕒 ${a.timestamp}</span>
          <span>📍 ${a.location}</span>
        </div>
        <p class="anomaly-card-desc">${a.details}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="anomaly-btn-inspect" data-action="view-anomaly" data-id="${a.id}">
            🔍 View Diagnostic Details
          </button>
          <button type="button" class="anomaly-btn-inspect" data-action="view-tx" data-tx-id="${a.transformerId}" style="color: #38BDF8;">
            ⚡ Inspect Transformer ${a.transformerId}
          </button>
        </div>
      </div>
    `).join('');
  }

  renderMapNodes() {
    return this.transformers.map(t => {
      // Calculate scaled positions for 700x440 viewport
      const cx = (t.x / 100) * 700;
      const cy = (t.y / 100) * 440;
      
      let ringColor = '#10B981';
      let haloColor = 'rgba(16, 185, 129, 0.2)';
      if (t.status === 'CRITICAL') {
        ringColor = '#FF3B30';
        haloColor = 'rgba(255, 59, 48, 0.4)';
      } else if (t.status === 'WARNING') {
        ringColor = '#F59E0B';
        haloColor = 'rgba(245, 158, 11, 0.3)';
      }

      const isCritical = t.status === 'CRITICAL';

      return `
        <g class="map-tx-node" data-tx-id="${t.id}" transform="translate(${cx}, ${cy})">
          <!-- Pulsing halo for active alerts -->
          <circle cx="0" cy="0" r="${isCritical ? 26 : 20}" fill="${haloColor}">
            ${isCritical ? '<animate attributeName="r" values="22;30;22" dur="1.8s" repeatCount="indefinite"/>' : ''}
          </circle>
          
          <!-- Outer border ring -->
          <circle cx="0" cy="0" r="16" fill="#0E1624" stroke="${ringColor}" stroke-width="${isCritical ? 3 : 2}" />
          
          <!-- Transformer Core Symbol (Two interlocking circles or lightning bolt) -->
          <circle cx="-3" cy="0" r="5" stroke="#E2E8F0" stroke-width="1.2" fill="none" />
          <circle cx="3" cy="0" r="5" stroke="#E2E8F0" stroke-width="1.2" fill="none" />

          <!-- Node ID text inside/above -->
          <text x="0" y="4" text-anchor="middle" font-family="'Inter', sans-serif" font-size="8" font-weight="800" fill="#FFFFFF">
            T${t.id}
          </text>

          <!-- Label Box below node -->
          <g transform="translate(0, 24)">
            <rect x="-55" y="0" width="110" height="20" rx="4" fill="#0C121D" stroke="#1F2D3E" stroke-width="1" />
            <text x="0" y="13" text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">
              ${t.code}: ${t.voltage.split(' ')[0]}
            </text>
          </g>
        </g>
      `;
    }).join('');
  }

  renderCascadingLogsTree() {
    return this.cascadingLogs.map((group, idx) => `
      <div class="control-unit-group">
        <div class="control-unit-header" data-unit-idx="${idx}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #38BDF8;">▼</span>
            <span>${group.unit}</span>
            <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${group.substation})</span>
          </div>
          <span class="unit-badge">${group.transformers.length} Transformers</span>
        </div>

        <div class="unit-transformers-list" id="unit-tx-list-${idx}">
          ${group.transformers.map(t => `
            <div class="tx-cascade-row" data-tx-id="${t.id}">
              <div>
                <span class="tx-cascade-name">↳ ${t.name}</span>
                <span style="font-size: 11px; margin-left: 8px; color: #38BDF8;">[${t.serial}]</span>
                <div class="tx-cascade-history">
                  ${t.historyLog}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="anomaly-status-badge ${t.status === 'NORMAL' ? 'resolved' : t.status.toLowerCase()}">
                  ${t.status}
                </span>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                  Oil: ${t.oilTemp}°C &bull; ${t.loadPct}%
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  async fetchData() {
    try {
      const res = await window.api.get('/admin/network-telemetry');
      this.transformers = res.transformers || [];
      this.anomalies = res.anomalies || [];
      this.cascadingLogs = res.cascadingLogs || [];
      this.deployment = res.deployment || {
        engineer: 'Mr. Raghavan',
        target: 'Transformer 3 (Kadugodi)',
        reason: 'Current spike detected at #2A, opp. market, Kadugodi',
        status: 'Not done',
        deployedAt: '17/10/2026 06:28 IST',
        eta: '12 minutes',
        equipment: 'Thermal IR Camera, Dissolved Gas Sniffer, Clamp Meter'
      };
    } catch (err) {
      console.warn('Network telemetry fetch error:', err);
    }
  }

  bindEvents() {
    // 1. Filter tabs on Anomaly list
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeAnomalyFilter = e.currentTarget.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const container = document.getElementById('anomaly-cards-container');
        if (container) container.innerHTML = this.renderAnomalyCards();
        this.bindAnomalyEvents();
      });
    });

    // 2. Map nodes click triggers popup
    document.querySelectorAll('.map-tx-node').forEach(node => {
      node.addEventListener('click', () => {
        const txId = parseInt(node.dataset.txId, 10);
        this.openTransformerModal(txId);
      });
    });

    // 3. Cascading row click
    document.querySelectorAll('.tx-cascade-row').forEach(row => {
      row.addEventListener('click', () => {
        const txId = parseInt(row.dataset.txId, 10);
        this.openTransformerModal(txId);
      });
    });

    // 4. Toggle deployment status button (Mr. Raghavan)
    const toggleDeployBtn = document.getElementById('btn-toggle-deployment');
    if (toggleDeployBtn) {
      toggleDeployBtn.addEventListener('click', async () => {
        const newStatus = this.deployment.status === 'Resolved' ? 'Not done' : 'Resolved';
        try {
          await window.api.post('/admin/resolve-anomaly', {
            anomalyId: 1, // Anomaly 1 is for Transformer 3
            newStatus
          });
          this.deployment.status = newStatus;
          window.toast.success(
            newStatus === 'Resolved' ? 'Anomaly Resolved' : 'Anomaly Reopened',
            `Status for ${this.deployment.target} updated to '${newStatus}'.`
          );
          // Refresh data and re-render
          await this.render(this.container);
        } catch (err) {
          window.toast.error('Update Failed', err.message || 'Could not update status');
        }
      });
    }

    // 5. Logout
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      window.auth.logout();
    });

    // 6. Bind anomaly buttons
    this.bindAnomalyEvents();
  }

  bindAnomalyEvents() {
    document.querySelectorAll('.anomaly-btn-inspect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'view-anomaly') {
          const aId = parseInt(btn.dataset.id, 10);
          this.openAnomalyDeepModal(aId);
        } else if (action === 'view-tx') {
          const txId = parseInt(btn.dataset.txId, 10);
          this.openTransformerModal(txId);
        }
      });
    });
  }

  // POPUP 1: Transformer Details & Waveforms (Handwritten Page 05 sketch)
  openTransformerModal(txId) {
    const t = this.transformers.find(tx => tx.id === txId);
    if (!t) return;

    this.selectedTransformer = t;
    const modal = document.getElementById('tx-details-modal');
    const content = document.getElementById('tx-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="tx-modal-header">
        <div>
          <h3 class="tx-modal-title">⚡ ${t.name} (${t.code})</h3>
          <span style="font-size: 12px; color: #38BDF8;">${t.substation} &bull; ${t.controlUnit}</span>
        </div>
        <button type="button" class="tx-modal-close-btn" id="close-tx-modal">&times;</button>
      </div>

      <div class="tx-modal-body">
        <!-- Location & Telemetry Metadata Grid (Handwritten Page 05) -->
        <div class="tx-info-grid">
          <div class="tx-info-item">
            <span class="label">Location</span>
            <span class="val">${t.location}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">GPS Co-ordinates</span>
            <span class="val" style="font-family: var(--font-mono);">${t.gps}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Substation</span>
            <span class="val">${t.substation}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Control Unit</span>
            <span class="val">${t.controlUnit}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Voltage & Capacity</span>
            <span class="val">${t.voltage} &bull; ${t.mva}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Status</span>
            <span class="anomaly-status-badge ${t.status === 'NORMAL' ? 'resolved' : t.status.toLowerCase()}">
              ${t.status}
            </span>
          </div>
        </div>

        <!-- Live Waveforms Grid (Sketched on Page 05) -->
        <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 12px;">
          📈 Live High-Voltage Waveforms & Diagnostics
        </div>

        <div class="waveforms-container">
          <!-- Current Waveform (A) with IB: 210A spike -->
          <div class="waveform-card">
            <div class="waveform-card-title">
              <span>Phase-B Current Waveform (A)</span>
              <span style="color: ${t.currentPeak.includes('210') ? '#FF3B30' : '#10B981'}; font-family: var(--font-mono); font-size: 13px;">
                ${t.currentPeak}
              </span>
            </div>
            <svg class="waveform-svg" viewBox="0 0 300 80">
              <path d="M 0 40 Q 37.5 ${t.currentPeak.includes('210') ? '5' : '15'}, 75 40 T 150 40 T 225 40 T 300 40" 
                    fill="none" stroke="${t.currentPeak.includes('210') ? '#FF3B30' : '#38BDF8'}" stroke-width="2.5" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1F2D3E" stroke-dasharray="3 3" />
            </svg>
            <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
              <span>Peak: ${t.currentPeak}</span>
              <span>Nominal: 95A</span>
            </div>
          </div>

          <!-- Voltage Waveform (V) -->
          <div class="waveform-card">
            <div class="waveform-card-title">
              <span>Bus Voltage Waveform (V)</span>
              <span style="color: #38BDF8; font-family: var(--font-mono); font-size: 13px;">
                ${t.voltageRMS}
              </span>
            </div>
            <svg class="waveform-svg" viewBox="0 0 300 80">
              <path d="M 0 40 Q 37.5 12, 75 40 T 150 40 T 225 40 T 300 40" 
                    fill="none" stroke="#10B981" stroke-width="2.5" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1F2D3E" stroke-dasharray="3 3" />
            </svg>
            <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
              <span>Grid Frequency: ${t.frequency} Hz</span>
              <span>Power Factor: ${t.powerFactor} PF</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Gauges Row -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: #090E17; border: 1px solid #1C2B3C; border-radius: 8px; padding: 10px 14px;">
            <div style="font-size: 11px; color: var(--text-muted);">Top Oil Temp</div>
            <div style="font-size: 18px; font-weight: 700; color: ${t.oilTemp > 80 ? '#FF3B30' : '#FFFFFF'};">
              ${t.oilTemp}°C
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted);">Threshold: 75°C</div>
          </div>
          <div style="background: #090E17; border: 1px solid #1C2B3C; border-radius: 8px; padding: 10px 14px;">
            <div style="font-size: 11px; color: var(--text-muted);">Winding Hotspot</div>
            <div style="font-size: 18px; font-weight: 700; color: ${t.windingTemp > 90 ? '#FF3B30' : '#FFFFFF'};">
              ${t.windingTemp}°C
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted);">Threshold: 90°C</div>
          </div>
          <div style="background: #090E17; border: 1px solid #1C2B3C; border-radius: 8px; padding: 10px 14px;">
            <div style="font-size: 11px; color: var(--text-muted);">DGA Gas State</div>
            <div style="font-size: 14px; font-weight: 700; color: ${t.dgaStatus.includes('CRITICAL') ? '#FF3B30' : '#10B981'}; margin-top: 3px;">
              ${t.dgaStatus}
            </div>
          </div>
        </div>

        <!-- Anomaly Trigger Button (Handwritten Page 05: Anomaly -> [View Details]) -->
        <div style="background: #111A26; border: 1px solid #213248; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: #FFFFFF; font-size: 14px;">
              ${t.id === 3 ? '⚠️ Active Anomaly: Phase-B Current Surge' : 'Anomaly Status Log'}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              ${t.historyLog}
            </div>
          </div>
          <button type="button" class="btn-primary" id="btn-modal-open-anomaly-deep" style="padding: 8px 18px; font-size: 13px;">
            Anomaly &rarr; View Details
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('close-tx-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    document.getElementById('btn-modal-open-anomaly-deep')?.addEventListener('click', () => {
      modal.style.display = 'none';
      const relatedAnomaly = this.anomalies.find(a => a.transformerId === txId) || this.anomalies[0];
      this.openAnomalyDeepModal(relatedAnomaly.id);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // POPUP 2: Anomaly Deep Diagnostic Details & Waveform Comparison (Page 05 sketch)
  openAnomalyDeepModal(anomalyId) {
    const a = this.anomalies.find(item => item.id === anomalyId) || this.anomalies[0];
    const modal = document.getElementById('anomaly-deep-modal');
    const content = document.getElementById('anomaly-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="tx-modal-header">
        <div>
          <h3 class="tx-modal-title">🔍 Anomaly Detail Diagnostic Report</h3>
          <span style="font-size: 12px; color: #FF7B72;">Incident ID: GW-ANOM-${a.id} &bull; ${a.title}</span>
        </div>
        <button type="button" class="tx-modal-close-btn" id="close-anomaly-modal">&times;</button>
      </div>

      <div class="tx-modal-body">
        <!-- Diagnostic Summary Table (Handwritten Page 05 bottom) -->
        <div class="tx-info-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="tx-info-item">
            <span class="label">Trigger Details (Date & Time in IST)</span>
            <span class="val" style="color: #38BDF8;">${a.timestamp}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Transformer ID</span>
            <span class="val">Transformer ${a.transformerId} (${a.location})</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Severity Level</span>
            <span class="anomaly-status-badge ${a.severity.toLowerCase()}">${a.severity}</span>
          </div>
          <div class="tx-info-item">
            <span class="label">Classification</span>
            <span class="val">${a.classification}</span>
          </div>
        </div>

        <div style="background: #090E17; border: 1px solid #1C2B3C; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #F59E0B; margin-bottom: 4px;">
            Diagnostic Insights
          </div>
          <div style="font-size: 13.5px; color: #CBD5E1; line-height: 1.5;">
            <strong>Root cause:</strong> ${a.rootCause}
          </div>
        </div>

        <!-- Before vs After Spike Comparison (Exact sketch from Page 05 bottom left) -->
        <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px;">
          ⚡ Before vs After Spike Waveform Comparison
        </div>

        <div class="comparison-waveform-box">
          <div class="comp-box">
            <div class="comp-box-title">Before Spike (Normal Steady Wave)</div>
            <svg style="width: 100%; height: 75px; display: block;" viewBox="0 0 240 60">
              <path d="M 0 30 Q 30 10, 60 30 T 120 30 T 180 30 T 240 30" 
                    fill="none" stroke="#10B981" stroke-width="2" />
              <line x1="0" y1="30" x2="240" y2="30" stroke="#1E2A3A" stroke-dasharray="3 3"/>
            </svg>
            <div style="font-size: 11px; color: #94A3B8;">Nominal 95A &bull; THD &lt; 1.2%</div>
          </div>

          <div class="comp-box" style="border-color: rgba(255, 59, 48, 0.4);">
            <div class="comp-box-title" style="color: #FF6961;">After Spike (210A Transient Surge)</div>
            <svg style="width: 100%; height: 75px; display: block;" viewBox="0 0 240 60">
              <path d="M 0 30 Q 30 2, 60 30 T 120 30 T 180 30 T 240 30" 
                    fill="none" stroke="#FF3B30" stroke-width="3" />
              <line x1="0" y1="30" x2="240" y2="30" stroke="#1E2A3A" stroke-dasharray="3 3"/>
            </svg>
            <div style="font-size: 11px; color: #FF7B72;">Surge IB: 210A &bull; +121% Distortion</div>
          </div>
        </div>

        <!-- Field Actions & Interactive Resolution Tools (Handwritten Page 05) -->
        <div style="background: #111A28; border: 1px solid #1E2D40; border-radius: 10px; padding: 16px; margin-top: 14px;">
          <div style="font-size: 12.5px; font-weight: 700; color: #38BDF8; margin-bottom: 4px;">
            Field Actions
          </div>
          <div style="font-size: 13px; color: #E2E8F0; margin-bottom: 14px;">
            ${a.fieldAction} &bull; <strong>Assigned:</strong> ${this.deployment.engineer} (${this.deployment.status})
          </div>

          <div style="display: flex; gap: 12px;">
            <button 
              type="button" 
              class="btn-primary" 
              id="btn-resolve-anomaly-modal"
              style="flex: 1; justify-content: center; background: ${a.status === 'Resolved' ? '#212C3D' : 'linear-gradient(135deg, #10B981, #059669)'};"
            >
              ${a.status === 'Resolved' ? '↺ Reopen Anomaly' : '✓ Mark Anomaly as Resolved'}
            </button>
            <button type="button" class="btn-secondary" id="btn-close-deep-modal" style="padding: 0 20px;">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('close-anomaly-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    document.getElementById('btn-close-deep-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    document.getElementById('btn-resolve-anomaly-modal')?.addEventListener('click', async () => {
      const newStatus = a.status === 'Resolved' ? 'In Progress' : 'Resolved';
      try {
        await window.api.post('/admin/resolve-anomaly', {
          anomalyId: a.id,
          newStatus
        });
        a.status = newStatus;
        window.toast.success('Status Updated', `Anomaly #${a.id} set to '${newStatus}'.`);
        modal.style.display = 'none';
        await this.render(this.container);
      } catch (err) {
        window.toast.error('Error', err.message || 'Failed to update');
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

window.AdminView = AdminView;
