import api from '../api/axios';

export const jobService = {
    getJobs: (params) => api.get('/jobs', { params }),
    getJobById: (id) => api.get(`/jobs/${id}`),
    getNearbyJobs: (params) => api.get('/jobs/nearby', { params }),
    createJob: (data) => api.post('/jobs', data),
    updateJob: (id, data) => api.patch(`/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
};
