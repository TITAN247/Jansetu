import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// context is used to enforce role-wise login on backend:
// e.g. 'public' for citizen/worker/local authority portal,
//       'admin_portal' for administration-only portal.
export const loginUser = async (email, password, context) => {
    const payload = { email, password };
    if (context) {
        payload.context = context;
    }
    const response = await api.post('/auth/login', payload);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const submitComplaint = async (formData) => {
    const response = await api.post('/complaint/submit', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getUserComplaints = async (userId) => {
    const response = await api.get(`/complaint/user/${userId}`);
    return response.data;
};

export const getAssignedTasks = async (department) => {
    const response = await api.get(`/worker/assigned?department=${department}`);
    return response.data;
};

export const uploadWorkerWork = async (formData) => {
    // Debug: Ensure FormData has content
    // console.log("Uploading FormData...");

    // Create a fresh request to avoid 'Content-Type: application/json' default from 'api' instance
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/worker/upload-work`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type. Let browser set 'multipart/form-data; boundary=...'
        }
    });
    return response.data;
};

export const submitFeedback = async (data) => {
    const response = await api.post('/complaint/feedback', data);
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

export const getAllComplaints = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/all${query ? '?' + query : ''}`);
    return response.data;
};

// Governance API
export const getGovernanceAnalytics = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/analytics${query}`);
    return response.data;
};

export const getDeptPerformance = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/department-performance${query}`);
    return response.data;
};

export const getComplaintTrends = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/trends${query}`);
    return response.data;
};

export const getAIMetrics = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/ai-metrics${query}`);
    return response.data;
};

export const getComplaintDetails = async (id) => {
    const response = await api.get(`/complaint/${id}`);
    return response.data;
};

export const getComplaintsByEmail = async (email) => {
    const response = await api.get(`/complaint/by-email/${encodeURIComponent(email)}`);
    return response.data;
};

// ============ DEPT OFFICER API ============
export const getDeptOfficerDashboard = async (department) => {
    const response = await api.get(`/dept-officer/dashboard?department=${department}`);
    return response.data;
};

export const getDeptComplaints = async (department) => {
    const response = await api.get(`/dept-officer/complaints?department=${department}`);
    return response.data;
};

export const getDeptWorkers = async (department) => {
    const response = await api.get(`/dept-officer/workers?department=${department}`);
    return response.data;
};

export const assignComplaint = async (complaintId, workerId, officerId, deadline) => {
    const response = await api.post('/dept-officer/assign', {
        complaint_id: complaintId, worker_id: workerId, officer_id: officerId, deadline
    });
    return response.data;
};

export const reassignComplaint = async (complaintId, workerId, officerId) => {
    const response = await api.post('/dept-officer/reassign', {
        complaint_id: complaintId, worker_id: workerId, officer_id: officerId
    });
    return response.data;
};

// ============ WORKER API (UPDATED) ============
export const getWorkerAssignedTasks = async (workerId) => {
    const response = await api.get(`/worker/assigned?worker_id=${workerId}`);
    return response.data;
};

export const acceptTask = async (complaintId, workerId) => {
    const response = await api.post('/worker/accept', {
        complaint_id: complaintId, worker_id: workerId
    });
    return response.data;
};

// ============ ADMIN INTERVENTION API ============
export const getEscalatedComplaints = async () => {
    const response = await api.get('/admin/escalated');
    return response.data;
};

export const getDeptOfficers = async () => {
    const response = await api.get('/admin/dept-officers');
    return response.data;
};

export const overrideComplaintStatus = async (complaintId, status, note) => {
    const response = await api.post('/admin/override-status', {
        complaint_id: complaintId, status, note
    });
    return response.data;
};

export const adminReassign = async (complaintId, department, workerId, note) => {
    const response = await api.post('/admin/reassign', {
        complaint_id: complaintId, department, worker_id: workerId, note
    });
    return response.data;
};

export default api;
export const getNotifications = async (userId) => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data;
};

// ============ REOPEN / APPEAL API ============
export const reopenComplaint = async (complaintId, reason) => {
    const response = await api.post('/complaint/reopen', {
        complaint_id: complaintId, reason
    });
    return response.data;
};

// Smart assignment is now automatic on complaint submission (backend)
// No frontend API call needed for smart-assign

// ============ ADMIN ACCESS CODE API ============
export const verifyAdminAccessCode = async (accessCode) => {
    const response = await api.post('/admin/verify-access-code', {
        access_code: accessCode
    });
    return response.data;
};

// ============ UP DISTRICTS API ============
export const getUPDistricts = async () => {
    const response = await api.get('/admin/up-districts');
    return response.data;
};

