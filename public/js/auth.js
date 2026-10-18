// GridWatch Authentication Service

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async checkSession() {
    if (!window.api.token) {
      this.user = null;
      this.isAuthenticated = false;
      return null;
    }

    try {
      const data = await window.api.get('/auth/me');
      if (data && data.user) {
        this.user = data.user;
        this.isAuthenticated = true;
        return { user: data.user, redirectUrl: data.redirectUrl };
      }
    } catch (err) {
      window.api.clearToken();
      this.user = null;
      this.isAuthenticated = false;
    }
    return null;
  }

  async login({ username, password, selectedRole, rememberMe }) {
    try {
      const data = await window.api.post('/auth/login', {
        username,
        password,
        selectedRole,
        rememberMe: !!rememberMe
      });

      if (data.token) {
        window.api.setToken(data.token, rememberMe);
        this.user = data.user;
        this.isAuthenticated = true;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async logout() {
    try {
      await window.api.post('/auth/logout', {});
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      window.api.clearToken();
      this.user = null;
      this.isAuthenticated = false;
      window.dispatchEvent(new CustomEvent('gridwatch:logout'));
    }
  }

  async requestPasswordReset(identifier) {
    return await window.api.post('/auth/forgot-password', { identifier });
  }

  async resetPassword(resetToken, newPassword) {
    return await window.api.post('/auth/reset-password', { resetToken, newPassword });
  }
}

window.auth = new AuthService();
