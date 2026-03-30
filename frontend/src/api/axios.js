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

            if (status === 401) {
                // Determine if this was a login attempt or an expired session
                // Any 401 on auth endpoints is a failure, not an expiration
                const isAuthRequest = error.config.url.includes('/login') || error.config.url.includes('/google');

                if (!isAuthRequest) {
                    // Unauthorized - token expired or invalid
                    localStorage.removeItem('rw_token');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    message = 'Session expired. Please log in again.';
                } else {
                    // Login failure — the backend message should be used
                    message = data.message || 'Incorrect email or password.';
                }
            } else if (status === 403) {
                message = "You don't have permission to do that.";
            } else if (status === 404) {
                // Don't toast 404 — let each caller handle it
                return Promise.reject(error);
            } else if (data && data.message) {
                // Backend provided a specific error message
                message = data.message;
            }
        } else if (error.request) {
            // Network error (no response received)
            message = 'Cannot connect to server. Check your internet.';
        }

        // Show toast for error
        toast.error(message);

        return Promise.reject(error);
    }
);

export default api;
