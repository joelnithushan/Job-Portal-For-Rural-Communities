import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

export const RoleRoute = ({ children, roles = [] }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        // User doesn't have the required role, redirect based on their actual role
        switch (user?.role) {
            case 'EMPLOYER':
                return <Navigate to="/employer" replace />;
            case 'ADMIN':
                return <Navigate to="/admin" replace />;
            case 'JOB_SEEKER':
            default:
                return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};
