import api from './axios';

export const authAPI = {
    sendRegisterOtp: (data) => api.post('/auth/send-register-otp', data),
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
    googleLogin: (data) => api.post('/auth/google', data),
};

export const jobsAPI = {
    getJobs: (params) => api.get('/jobs', { params }),
    getNearbyJobs: (params) => api.get('/jobs/nearby', { params }),
    getMyJobs: (params) => api.get('/jobs/mine', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    createJob: (data) => api.post('/jobs', data),
    updateJob: (id, data) => api.patch(`/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
};

export const applicationsAPI = {
    applyToJob: (data) => api.post('/applications', data),
    uploadCV: (formData) => api.post('/applications/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getMyApplications: () => api.get('/applications/me'),
    getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
    getEmployerApplications: () => api.get('/applications/employer'),
    updateAppStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
    withdrawApplication: (id) => api.delete(`/applications/${id}`),
};

export const companiesAPI = {
    createCompany: (data) => api.post('/companies', data),
    getMyCompany: () => api.get('/companies/me'),
    getCompanyById: (id) => api.get(`/companies/${id}`),
    updateMyCompany: (data) => api.patch('/companies/me', data),
    deleteMyCompany: () => api.delete('/companies/me'),
};

export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    updateUserStatus: (id, { status, reason }) => api.patch(`/admin/users/${id}/status`, { status, reason }),
    getJobs: () => api.get('/admin/jobs'),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    getApplications: () => api.get('/admin/applications'),
    deleteApplication: (id) => api.delete(`/admin/applications/${id}`),
    getAdminCompanies: () => api.get('/admin/companies'),
    verifyCompany: (id) => api.patch(`/admin/companies/${id}/verify`),
    suspendCompany: (id, reason) => api.patch(`/admin/companies/${id}/suspend`, { reason }),
    getNotifications: () => api.get('/admin/notifications'),
    getReports: (params) => api.get('/admin/reports', { params }),
};

export const profileAPI = {
    getProfile: () => api.get('/profile/me'),
    updateProfile: (data) => api.patch('/profile/me', data),
    deleteAccount: () => api.delete('/profile/me'),
    uploadProfilePicture: (formData) => api.post('/profile/me/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteProfilePicture: () => api.delete('/profile/me/picture'),
};

export const postersAPI = {
    generate: (data) => api.post('/posters/generate', data),
    create: (data) => api.post('/posters', data),
    getPublic: (params) => api.get('/posters', { params }),
    getMine: () => api.get('/posters/mine'),
    getById: (id) => api.get(`/posters/${id}`),
    update: (id, data) => api.patch(`/posters/${id}`, data),
    delete: (id) => api.delete(`/posters/${id}`),
};

export const notificationsAPI = {
    getMyNotifications: () => api.get('/notifications/me'),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};
