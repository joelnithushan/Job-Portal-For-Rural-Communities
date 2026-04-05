import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: add the JWT token to headers if it exists
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

// Helper to map technical error codes to friendly messages
const ERROR_MAP = {
    'INCOMPLETE_PROFILE': 'Please complete your profile (NIC, Phone, District, Bio) to perform this action.',
    'SUSPENDED': 'Your account has been suspended. Please contact support for more information.',
    'ALREADY_APPLIED': 'You have already applied for this job.',
    'CV_REQUIRED': 'A CV is required for this application.',
    'NOT_AUTHORIZED': 'You do not have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
};

// Response Interceptor: extract data directly, handle global errors
api.interceptors.response.use(
    (response) => {
        // Return data directly to avoid needing .data in every call
        return response.data;
    },
    (error) => {
        // Determine the error message
        let message = 'Something went wrong. Please try again.';

        if (error.response) {
            const { status, data } = error.response;
            const backendMessage = data?.message || data?.error || '';

            // 1. Check if the message is a technical code we should map
            if (ERROR_MAP[backendMessage]) {
                message = ERROR_MAP[backendMessage];
            } else if (status === 401) {
                // Determine if this was a login attempt or an expired session
                // Any 401 on auth endpoints is a failure, not an expiration
                const isAuthRequest = error.config.url.includes('/login') || error.config.url.includes('/google');

                if (!isAuthRequest) {
                    // Unauthorized - token expired or invalid
                    localStorage.removeItem('rw_token');
                    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                        window.location.href = '/login';
                    }
                    message = 'Session expired. Please log in again.';
                } else {
                    // Login failure — use backend message or default
                    message = backendMessage || 'Incorrect email or password.';
                }
            } else if (status === 403) {
                // For 403, prioritize the backend message (e.g., "Your account is suspended: [reason]")
                message = backendMessage || ERROR_MAP['NOT_AUTHORIZED'];
            } else if (status === 404) {
                // Don't toast 404 by default — let callers handle it if they want
                return Promise.reject(error);
            } else if (backendMessage) {
                // Fallback to whatever string the backend provided
                message = backendMessage;
            }
        } else if (error.request) {
            // Network error (no response received)
            message = 'Cannot connect to server. Please check your internet connection.';
        }

        // Show toast for error
        toast.error(message);

        return Promise.reject(error);
    }
);

export default api;
