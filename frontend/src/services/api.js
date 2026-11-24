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

    // Try parsing json
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
 * Standardized API Client
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

  // Creator
  creator: {
    getProfile: () => request("/api/creator/profile"),
    getPublicProfile: (id) => request(`/api/creator/profile/${id}`),
    updateProfile: (profileData) =>
      request("/api/creator/profile", { method: "POST", body: profileData }),
    signMou: (mouData) =>
      request("/api/creator/mou", { method: "POST", body: mouData }),
    getMatchedCampaigns: () => request("/api/creator/matched-campaigns"),
    applyToCampaign: (data) =>
      request("/api/creator/apply-campaign", { method: "POST", body: data })
  },

  // Brand
  brand: {
    createCampaign: (data) =>
      request("/api/brand/campaign", { method: "POST", body: data }),
    getCampaigns: () => request("/api/brand/campaigns"),
    getApplicants: (campaignId) =>
      request(`/api/brand/campaign/${campaignId}/applicants`),
    updateApplication: (campaignId, appId, status) =>
      request(`/api/brand/campaign/${campaignId}/applications/${appId}`, {
        method: "PATCH",
        body: { status }
      })
  },

  // Projects
  projects: {
    create: (projectData) =>
      request("/api/projects", { method: "POST", body: projectData }),
    list: (params = "") => request(`/api/projects${params}`),
    getById: (id) => request(`/api/projects/${id}`)
  },

  // Investments & Investor Experience
  investments: {
    contribute: (projectId, amount) =>
      request("/api/investments/contribute", {
        method: "POST",
        body: { project_id: projectId, amount: Number(amount) }
      }),
    getDashboard: () => request("/api/investments/dashboard"),
    simulateRevenue: (projectId, revenueAmount) =>
      request("/api/investments/simulate-revenue", {
        method: "POST",
        body: { project_id: projectId, revenue_amount: Number(revenueAmount) }
      })
  },

  // Escrow & Milestones
  escrow: {
    submitMilestone: (milestoneId, data) =>
      request(`/api/escrow/milestones/${milestoneId}/submit`, {
        method: "POST",
        body: data
      }),
    approveMilestone: (milestoneId, data = {}) =>
      request(`/api/escrow/milestones/${milestoneId}/approve`, {
        method: "POST",
        body: data
      }),
    rejectMilestone: (milestoneId, data = {}) =>
      request(`/api/escrow/milestones/${milestoneId}/reject`, {
        method: "POST",
        body: data
      }),
    getTransactions: (projectId) =>
      request(`/api/escrow/projects/${projectId}/transactions`)
  },

  // Gemini AI Assistant
  ai: {
    generateIdeas: (query) =>
      request("/api/ai/ideas", { method: "POST", body: { query } })
  }
};

export default api;
