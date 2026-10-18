// GridWatch Application Router and Orchestrator

class Router {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentView = null;

    // Listen for custom auth events
    window.addEventListener('gridwatch:unauthorized', () => {
      window.toast.warning('Session Expired', 'Please re-authenticate to continue.');
      this.navigate('/login');
    });

    window.addEventListener('gridwatch:logout', () => {
      window.toast.info('Logged Out', 'Your session has been terminated safely.');
      this.navigate('/login');
    });

    // Listen for browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
  }

  getAuthorizedRedirectUrl(user) {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'control_room') return '/control-room';
    if (user.role === 'substation_team') {
      if (user.job_function === 'field_engineer') return '/substation/field-engineer';
      return '/substation/operator';
    }
    return '/login';
  }

  isAuthorizedForPath(path, user) {
    if (!user) return false;
    if (path === '/mobile') return true;

    // Admin has supervisory access to all portals
    if (user.role === 'admin') return true;

    if (path === '/admin') {
      return user.role === 'admin';
    }

    if (path === '/control-room') {
      return user.role === 'control_room';
    }

    if (path.startsWith('/substation')) {
      if (user.role !== 'substation_team') return false;
      if (path === '/substation/field-engineer') {
        return user.job_function === 'field_engineer';
      }
      if (path === '/substation/operator') {
        return user.job_function === 'station_operator';
      }
      return true;
    }

    return true;
  }

  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.handleRoute(path);
  }

  async handleRoute(path) {
    // Normalize path
    if (!path || path === '/' || path === '/index.html') {
      path = '/login';
    }

    // Verify authentication status with server
    const session = await window.auth.checkSession();
    const user = window.auth.user;

    // Route Guard 1: Unauthenticated user accessing protected route
    if (!user && path !== '/login') {
      window.toast.warning('Authentication Required', 'Please log in with your role credentials.');
      this.navigate('/login');
      return;
    }

    // Route Guard 2: Authenticated user accessing login page
    if (user && path === '/login') {
      const targetUrl = this.getAuthorizedRedirectUrl(user);
      this.navigate(targetUrl);
      return;
    }

    // Route Guard 3: Role Authorization enforcement
    if (user && path !== '/login' && !this.isAuthorizedForPath(path, user)) {
      window.toast.error(
        'Access Denied',
        `Your account role '${user.role}' is not authorized to access ${path}. Redirecting to your assigned dashboard.`
      );
      const authorizedUrl = this.getAuthorizedRedirectUrl(user);
      this.navigate(authorizedUrl);
      return;
    }

    // Render corresponding view
    this.renderPath(path);
  }

  renderPath(path) {
    window.scrollTo(0, 0);

    if (path === '/login') {
      this.currentView = new window.LoginView();
      this.currentView.render(this.appContainer);
      return;
    }

    if (path === '/mobile') {
      this.currentView = new window.MobileView();
      this.currentView.render(this.appContainer);
      return;
    }

    if (path === '/admin') {
      this.currentView = new window.AdminView();
      this.currentView.render(this.appContainer);
      return;
    }

    if (path === '/control-room') {
      this.currentView = new window.ControlRoomView();
      this.currentView.render(this.appContainer);
      return;
    }

    if (path === '/substation/operator') {
      this.currentView = new window.StationOperatorView();
      this.currentView.render(this.appContainer);
      return;
    }

    if (path === '/substation/field-engineer') {
      this.currentView = new window.FieldEngineerView();
      this.currentView.render(this.appContainer);
      return;
    }

    // Fallback unknown routes to login or default
    this.navigate('/login');
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
  window.router.handleRoute(window.location.pathname);
});
