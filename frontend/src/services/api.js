const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Core HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem("lazarus_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${config.method || "GET"} ${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Standardized Lazarus V3 API Client
 */
export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: credentials
      });
      if (data.token) {
        localStorage.setItem("lazarus_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    register: async (userData) => {
      const data = await request("/api/auth/register", {
        method: "POST",
        body: userData
      });
      if (data.token) {
        localStorage.setItem("lazarus_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    me: () => request("/api/auth/me"),
    logout: () => {
      localStorage.removeItem("lazarus_token");
      localStorage.removeItem("user");
    }
  },

  // Social Media Integrations
  integrations: {
    getStatus: () => request("/api/integrations/status"),
    getAuthUrl: (platform) => request(`/api/integrations/${platform}/auth-url`),
    callback: (platform, data) =>
      request(`/api/integrations/${platform}/callback`, { method: "POST", body: data }),
    sync: (accountId) =>
      request(`/api/integrations/${accountId}/sync`, { method: "POST" }),
    disconnect: (accountId) =>
      request(`/api/integrations/${accountId}/disconnect`, { method: "POST" }),
    connectMock: (platform) =>
      request("/api/integrations/connect-mock", { method: "POST", body: { platform } })
  },

  // Creator Studio
  creator: {
    getProfile: () => request("/api/creator/profile"),
    getPublicProfile: (id) => request(`/api/creator/profile/${id}`),
    updateProfile: (profileData) =>
      request("/api/creator/profile", { method: "POST", body: profileData }),
    signMou: (mouData) =>
      request("/api/creator/mou", { method: "POST", body: mouData }),
    getAnalytics: () => request("/api/creator/analytics"),
    getContent: (params = "") => request(`/api/creator/content${params}`),
    getMediaKit: () => request("/api/creator/media-kit"),
    getPublicMediaKit: (id) => request(`/api/creator/media-kit/${id}`),
    getMatchedCampaigns: () => request("/api/creator/matched-campaigns"),
    applyToCampaign: (data) =>
      request("/api/creator/apply-campaign", { method: "POST", body: data })
  },

  // Brand Studio
  brand: {
    createCampaign: (data) =>
      request("/api/brand/campaign", { method: "POST", body: data }),
    getCampaigns: (params = "") => request(`/api/brand/campaigns${params}`),
    getApplicants: (campaignId) =>
      request(`/api/brand/campaign/${campaignId}/applicants`),
    updateApplication: (campaignId, appId, status) =>
      request(`/api/brand/campaign/${campaignId}/applications/${appId}`, {
        method: "PATCH",
        body: { status }
      }),
    discoverCreators: (params = "") => request(`/api/brand/creators${params}`)
  },

  // Collaborations
  collaborations: {
    list: () => request("/api/collaborations"),
    getById: (id) => request(`/api/collaborations/${id}`),
    transition: (id, status, note = "") =>
      request(`/api/collaborations/${id}/transition`, {
        method: "POST",
        body: { status, note }
      }),
    addDeliverable: (id, deliverableData) =>
      request(`/api/collaborations/${id}/deliverables`, {
        method: "POST",
        body: deliverableData
      }),
    submitDeliverable: (deliverableId, data) =>
      request(`/api/collaborations/deliverables/${deliverableId}/submit`, {
        method: "POST",
        body: data
      }),
    reviewDeliverable: (deliverableId, data) =>
      request(`/api/collaborations/deliverables/${deliverableId}/review`, {
        method: "POST",
        body: data
      })
  },

  // Notifications
  notifications: {
    list: (params = "") => request(`/api/notifications${params}`),
    markAsRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),
    markAllAsRead: () => request("/api/notifications/read-all", { method: "POST" })
  },

  // Admin Operations & Privacy
  admin: {
    getHealth: () => request("/api/admin/health"),
    getUsers: (params = "") => request(`/api/admin/users${params}`),
    toggleVerification: (brandId, isVerified) =>
      request(`/api/admin/brands/${brandId}/verification`, {
        method: "PATCH",
        body: { isVerified }
      }),
    getAuditLogs: (params = "") => request(`/api/admin/audit-logs${params}`),
    exportData: () => request("/api/admin/privacy/export"),
    deleteAccount: () => request("/api/admin/privacy/delete-account", { method: "DELETE" })
  },

  // Gemini AI Assistant
  ai: {
    generateIdeas: (query) =>
      request("/api/ai/ideas", { method: "POST", body: { query } })
  }
};

export default api;
