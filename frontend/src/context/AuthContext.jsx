import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('rw_token') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Auth state
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data?.user || response.data || response);
                } catch (error) {
                    console.error("Session verification failed", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token: newToken, user: userData } = response.data || response;

        // Save to local storage and state
        localStorage.setItem('rw_token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const register = async (userData) => {
        // API should return the token and user just like login on successful registration
        const response = await authAPI.register(userData);
        const { token: newToken, user: newUserData } = response.data || response;

        localStorage.setItem('rw_token', newToken);
        setToken(newToken);
        setUser(newUserData);

        return newUserData;
    };

    const logout = () => {
        localStorage.removeItem('rw_token');
        setToken(null);
        setUser(null);
        window.location.href = '/'; // Hard redirect to clear state entirely
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    // Provide state and actions
    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
