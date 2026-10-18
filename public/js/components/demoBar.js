// GridWatch Demo Quick-Fill Bar

function renderDemoBar(containerId, onFillCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const demoAccounts = [
    {
      label: 'Admin',
      icon: '👑',
      badge: 'Superuser',
      role: 'admin',
      username: 'admin.gridwatch',
      password: 'Admin@GridWatch2026!',
      desc: 'Security & Fleet Governance'
    },
    {
      label: 'Control Room',
      icon: '⚡',
      badge: 'Operator',
      role: 'control_room',
      username: 'cr.operator',
      password: 'Control@GridWatch2026!',
      desc: 'Grid Telemetry & Dispatch'
    },
    {
      label: 'Station Operator',
      icon: '🏭',
      badge: 'Substation Team',
      role: 'substation_team',
      username: 'operator.sub12',
      password: 'Station@GridWatch2026!',
      desc: 'Substation Local Diagnostics'
    },
    {
      label: 'Field Engineer',
      icon: '🔧',
      badge: 'Substation Team',
      role: 'substation_team',
      username: 'engineer.field',
      password: 'Field@GridWatch2026!',
      desc: 'Transformer Mobile Work Orders'
    },
    {
      label: 'Role Mismatch Test',
      icon: '🛡️',
      badge: 'Security Test',
      role: 'substation_team', // Selects substation_team portal but uses admin account to trigger mismatch rejection!
      username: 'admin.gridwatch',
      password: 'Admin@GridWatch2026!',
      desc: 'Tests backend role mismatch rejection'
    },
    {
      label: 'Locked Account',
      icon: '🔒',
      badge: 'Security Test',
      role: 'control_room',
      username: 'locked.user',
      password: 'Locked@Demo2026!',
      desc: 'Tests 5-failed-attempts security lockout'
    }
  ];

  let html = `
    <div class="demo-helper-bar">
      <div class="demo-helper-header">
        <span>⚡ Quick-Fill Credentials for Demonstration & Testing</span>
        <span style="color: var(--cyan-neon); font-size: 10px;">1-Click Auto-Fill</span>
      </div>
      <div class="demo-pills-grid">
  `;

  demoAccounts.forEach((acc, idx) => {
    html += `
      <button type="button" class="demo-pill-btn" data-index="${idx}" title="${acc.desc}">
        <span>${acc.icon}</span>
        <strong>${acc.label}</strong>
        <span class="pill-badge">${acc.badge}</span>
      </button>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.demo-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const acc = demoAccounts[idx];
      if (onFillCallback) {
        onFillCallback(acc);
      }
    });
  });
}

window.renderDemoBar = renderDemoBar;
