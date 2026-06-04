import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.endsWith('/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    user: () => api.get('/user'),
    verifyEmail: () => api.post('/email/verify'),
    sendVerification: () => api.post('/email/verification-notification'),
    resendVerification: () => api.post('/email/resend'),
    changePassword: (data) => api.post('/change-password', data),
    forgotPassword: (email) => api.post('/forgot-password', { email }),
    resetPassword: (data) => api.post('/reset-password', data),
};

export const students = {
    all: (params) => api.get('/students', { params }),
    find: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    search: (params) => api.get('/students/search', { params }),
    sort: (data) => api.post('/students/sort', data),
    filters: () => api.get('/students/filters'),
    exportUrl: () => '/api/students/export',
    import: (data) => api.post('/students/import', data),
};

export const notifications = {
    all: (page = 1) => api.get('/notifications', { params: { page } }),
    unreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
