import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('rw_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const ERROR_MAP = {
    'INCOMPLETE_PROFILE': 'Please complete your profile (NIC, Phone, District) to perform this action.',
    'INCOMPLETE_COMPANY': 'Please complete your company profile (Name, District, Town, Phone) before posting a job.',
    'COMPANY_NOT_VERIFIED': 'Your company is not verified yet. You can post jobs only after the admin verifies your company.',
    'COMPANY_SUSPENDED': 'Your company is currently suspended. Please contact support to restore posting access.',
    'SUSPENDED': 'Your account has been suspended. Please contact support for more information.',
    'ALREADY_APPLIED': 'You have already applied for this job.',
    'CV_REQUIRED': 'A CV is required for this application.',
    'NOT_AUTHORIZED': 'You do not have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
};

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Pages that handle the error themselves can pass `silent: true` in the
        // request config to suppress the global toast.
        const silent = error.config?.silent === true;
        let message = 'Something went wrong. Please try again.';

        if (error.response) {
            const { status, data } = error.response;
            const backendMessage = data?.message || data?.error || '';

            if (ERROR_MAP[backendMessage]) {
                message = ERROR_MAP[backendMessage];
            } else if (status === 401) {
                const isAuthRequest = error.config.url.includes('/login') || error.config.url.includes('/google');

                if (!isAuthRequest) {
                    localStorage.removeItem('rw_token');
                    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                        window.location.href = '/login';
                    }
                    message = 'Session expired. Please log in again.';
                } else {
                    message = backendMessage || 'Incorrect email or password.';
                }
            } else if (status === 403) {
                message = backendMessage || ERROR_MAP['NOT_AUTHORIZED'];
            } else if (status === 404) {
                return Promise.reject(error);
            } else if (backendMessage) {
                message = backendMessage;
            }
        } else if (error.request) {
            message = 'Cannot connect to server. Please check your internet connection.';
        }

        if (!silent && message) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;
