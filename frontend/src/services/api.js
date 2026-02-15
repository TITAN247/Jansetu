import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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

export const loginUser = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
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

export const getAllComplaints = async () => {
    const response = await api.get('/admin/all');
    return response.data;
};

// Governance API
export const getGovernanceAnalytics = async () => {
    const response = await api.get('/governance/analytics');
    return response.data;
};

export const getDeptPerformance = async () => {
    const response = await api.get('/governance/department-performance');
    return response.data;
};

export const getComplaintTrends = async () => {
    const response = await api.get('/governance/trends');
    return response.data;
};

export const getAIMetrics = async () => {
    const response = await api.get('/governance/ai-metrics');
    return response.data;
};

export const getComplaintDetails = async (id) => {
    const response = await api.get(`/complaint/${id}`);
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
