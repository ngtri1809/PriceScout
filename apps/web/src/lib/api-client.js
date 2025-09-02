// @ts-check

export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = undefined;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = undefined;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.title || 'API Error',
          data.detail || 'An error occurred',
          response.status,
          data.type || 'about:blank',
          data.instance
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Network Error',
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  // Auth endpoints
  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request('/auth/me', {
      method: 'DELETE',
    });
  }

  // Items endpoints
  async searchItems(query, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request(`/items/search?${params}`);
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async getItemPriceHistory(id, days = 30) {
    const params = new URLSearchParams({ days: days.toString() });
    return this.request(`/items/${id}/prices?${params}`);
  }

  // Compare endpoint
  async comparePrices(sku) {
    const params = new URLSearchParams({ sku });
    return this.request(`/compare?${params}`);
  }

  // Watchlist endpoints
  async getWatchlist() {
    return this.request('/watchlist');
  }

  async addToWatchlist(itemId) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  async removeFromWatchlist(itemId) {
    return this.request(`/watchlist/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Prediction endpoint
  async predictPrice(itemId, horizon = 14) {
    const params = new URLSearchParams({
      itemId,
      h: horizon.toString(),
    });
    return this.request(`/predict?${params}`);
  }

  // Notification preferences
  async getNotificationPreferences() {
    return this.request('/notifications/preferences');
  }

  async updateNotificationPreferences(data) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export class ApiError extends Error {
  constructor(title, detail, status, type = 'about:blank', instance) {
    super(detail);
    this.name = 'ApiError';
    this.title = title;
    this.detail = detail;
    this.status = status;
    this.type = type;
    this.instance = instance;
  }
}
