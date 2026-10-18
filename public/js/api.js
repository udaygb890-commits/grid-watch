// GridWatch API Client

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('gw_token') || sessionStorage.getItem('gw_token') || null;
  }

  setToken(token, remember = false) {
    this.token = token;
    if (remember) {
      localStorage.setItem('gw_token', token);
      sessionStorage.removeItem('gw_token');
    } else {
      sessionStorage.setItem('gw_token', token);
      localStorage.removeItem('gw_token');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('gw_token');
    sessionStorage.removeItem('gw_token');
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.clearToken();
          window.dispatchEvent(new CustomEvent('gridwatch:unauthorized'));
        }

        const error = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

window.api = new ApiClient();
