import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sidebar } from '../components/layout/Sidebar';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Pages
import { HomePage } from '../pages/public/HomePage';
import { JobsPage } from '../pages/public/JobsPage';
import { JobDetailPage, CompaniesPage } from '../pages/public/PublicPages';
import { DiscoverJobsPage } from '../pages/seeker/DiscoverJobsPage';
import { CompanyJobsPage } from '../pages/public/CompanyJobsPage';
import { useTranslation } from 'react-i18next';
import { LoginPage, RegisterPage, RegisterEmployerPage, ForgotPasswordPage, ResetPasswordPage } from '../pages/auth/AuthPages';
import { SeekerDashboard, MyApplicationsPage, SavedJobsPage } from '../pages/seeker/SeekerPages';
import { EmployerDashboard, PostJobPage, MyJobsPage, JobApplicationsPage, CompanyProfilePage } from '../pages/employer/EmployerPages';
import { AdminDashboard, AdminUsersPage, AdminCompaniesPage, AdminJobsPage, AdminReportsPage } from '../pages/admin/AdminPages';
import { ProfilePage } from '../pages/profile/ProfilePage';

const ProfileWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'JOB_SEEKER') {
        return (
            <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"><ProfilePage /></main>
            </div>
        );
    }
    return (
        <div className="flex min-h-screen bg-[#FAF7F2]">
            <Sidebar />
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><ProfilePage /></main>
            </div>
        </div>
    );
};

export const AppRouter = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();

    // Redirect authenticated users from home to their dashboard
    const getDashboardPath = () => {
        if (!user) return '/';
        if (user.role === 'ADMIN') return '/admin';
        if (user.role === 'EMPLOYER') return '/employer';
        return '/dashboard';
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/employer" element={<RegisterEmployerPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Public Routes with standard layout */}
                <Route path="/" element={
                    isAuthenticated ? (
                        <Navigate to={getDashboardPath()} replace />
                    ) : (
                        <>
                            <Navbar />
                            <main className="flex-1"><HomePage /></main>
                            <Footer />
                        </>
                    )
                } />
                <Route path="/jobs" element={
                    <>
                        <Navbar />
                        <main className="flex-1"><JobsPage /></main>
                        <Footer />
                    </>
                } />
                <Route path="/jobs/:id" element={
                    <>
                        <Navbar />
                        <main className="flex-1"><JobDetailPage /></main>
                        <Footer />
                    </>
                } />
                <Route path="/companies" element={
                    <>
                        <Navbar />
                        <main className="flex-1"><CompaniesPage /></main>
                        <Footer />
                    </>
                } />

                <Route path="/companies/:id/jobs" element={
                    <>
                        <Navbar />
                        <main className="flex-1"><CompanyJobsPage /></main>
                        <Footer />
                    </>
                } />

                {/* =========================================
            PROTECTED DASHBOARD ROUTES
            ========================================= */}

                {/* JOB SEEKER ROUTES */}
                <Route path="/dashboard" element={
                    <RoleRoute roles={['JOB_SEEKER']}>
                        <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
                            <Navbar />
                            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"><SeekerDashboard /></main>
                            <Footer />
                        </div>
                    </RoleRoute>
                } />
                <Route path="/dashboard/discover" element={
                    <RoleRoute roles={['JOB_SEEKER']}>
                        <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
                            <Navbar />
                            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"><DiscoverJobsPage /></main>
                            <Footer />
                        </div>
                    </RoleRoute>
                } />
                <Route path="/dashboard/applications" element={
                    <RoleRoute roles={['JOB_SEEKER']}>
                        <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
                            <Navbar />
                            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"><MyApplicationsPage /></main>
                            <Footer />
                        </div>
                    </RoleRoute>
                } />
                <Route path="/dashboard/saved" element={
                    <RoleRoute roles={['JOB_SEEKER']}>
                        <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
                            <Navbar />
                            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full"><SavedJobsPage /></main>
                            <Footer />
                        </div>
                    </RoleRoute>
                } />

                {/* PROFILE ROUTE — all authenticated users */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfileWrapper />
                    </ProtectedRoute>
                } />

                {/* EMPLOYER ROUTES */}
                <Route path="/employer" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><EmployerDashboard /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/employer/post-job" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><PostJobPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/employer/jobs" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><MyJobsPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/employer/applications" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><JobApplicationsPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/employer/jobs/:jobId/applications" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><JobApplicationsPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/employer/company" element={
                    <RoleRoute roles={['EMPLOYER']}>
                        <div className="flex min-h-screen bg-[#FAF7F2]">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
                                <Navbar />
                                <main className="flex-1 p-6 md:p-8 overflow-y-auto"><CompanyProfilePage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />

                {/* ADMIN ROUTES */}
                <Route path="/admin" element={
                    <RoleRoute roles={['ADMIN']}>
                        <div className="flex min-h-screen bg-brand-cream">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1 p-4 md:p-8"><AdminDashboard /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/admin/users" element={
                    <RoleRoute roles={['ADMIN']}>
                        <div className="flex min-h-screen bg-brand-cream">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1 p-4 md:p-8"><AdminUsersPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/admin/companies" element={
                    <RoleRoute roles={['ADMIN']}>
                        <div className="flex min-h-screen bg-brand-cream">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1 p-4 md:p-8"><AdminCompaniesPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/admin/jobs" element={
                    <RoleRoute roles={['ADMIN']}>
                        <div className="flex min-h-screen bg-brand-cream">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1 p-4 md:p-8"><AdminJobsPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />
                <Route path="/admin/reports" element={
                    <RoleRoute roles={['ADMIN']}>
                        <div className="flex min-h-screen bg-brand-cream">
                            <Sidebar />
                            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                                <Navbar />
                                <main className="flex-1 p-4 md:p-8"><AdminReportsPage /></main>
                            </div>
                        </div>
                    </RoleRoute>
                } />

                {/* 404 Catch-All */}
                <Route path="*" element={
                    <>
                        <Navbar />
                        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <h1 className="text-6xl font-heading text-brand-green mb-4">{t('not_found_404')}</h1>
                            <p className="text-xl text-brand-muted mb-8">{t('not_found_msg')}</p>
                            <a href="/" className="px-6 py-3 bg-brand-terra text-white rounded-xl font-medium hover:bg-brand-terraLight transition-colors">{t('not_found_btn')}</a>
                        </main>
                        <Footer />
                    </>
                } />
            </Routes>
        </div>
    );
};
