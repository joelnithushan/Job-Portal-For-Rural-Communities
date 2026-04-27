import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { LayoutDashboard, FileText, Heart, User, LogOut, PlusCircle, Briefcase, Users, Building, ClipboardList, Building2, Globe, BarChart2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const role = user?.role || 'JOB_SEEKER';

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
    };

    const navItems = {
        JOB_SEEKER: [
            { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
            { label: t('my_applications'), path: '/dashboard/applications', icon: FileText },
            { label: t('saved_jobs'), path: '/dashboard/saved', icon: Heart },
            { label: t('my_profile'), path: '/profile', icon: User },
        ],
        EMPLOYER: [
            { label: t('dashboard'), path: '/employer', icon: LayoutDashboard },
            { label: t('nav_post_job'), path: '/employer/post-job', icon: PlusCircle },
            { label: t('my_jobs'), path: '/employer/jobs', icon: Briefcase },
            { label: t('nav_applications'), path: '/employer/applications', icon: ClipboardList },
            { label: t('ai_poster_maker', { defaultValue: 'AI Poster Maker' }), path: '/employer/posters', icon: Sparkles },
            { label: t('company'), path: '/employer/company', icon: Building2 },
            { label: t('my_profile'), path: '/profile', icon: User },
        ],
        ADMIN: [
            { label: t('dashboard'), path: '/admin', icon: LayoutDashboard },
            { label: t('nav_users'), path: '/admin/users', icon: Users },
            { label: t('nav_companies_admin'), path: '/admin/companies', icon: Building },
            { label: t('all_jobs'), path: '/admin/jobs', icon: Briefcase },
            { label: t('manage_posters', { defaultValue: 'Manage Posters' }), path: '/admin/posters', icon: Sparkles },
            { label: t('nav_reports'), path: '/admin/reports', icon: BarChart2 },
        ]
    };

    const currentNav = navItems[role] || navItems.JOB_SEEKER;
    const panelHeaders = {
        JOB_SEEKER: t('sidebar_seeker_panel'),
        EMPLOYER: t('sidebar_emp_panel'),
        ADMIN: t('sidebar_admin_panel')
    };

    const logoutModal = (
        <Modal 
            isOpen={isLogoutModalOpen} 
            onClose={() => setIsLogoutModalOpen(false)}
            title={t('sidebar_logout_title')}
            size="sm"
        >
            <div className="flex flex-col py-1">
                <p className="text-brand-dark mb-6 font-['DM_Sans'] text-sm">
                    {t('sidebar_logout_desc')}
                </p>
                <div className="flex justify-end gap-3 w-full">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsLogoutModalOpen(false)}
                        className="rounded border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A]/10 font-['DM_Sans'] font-bold px-6 tracking-wide"
                    >
                        {t('sidebar_logout_cancel')}
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={confirmLogout}
                        className="rounded bg-[#8B1A1A] border-[#8B1A1A] text-[#E2B325] hover:bg-[#6e1515] hover:border-[#6e1515] font-['DM_Sans'] font-bold px-6 tracking-wide"
                    >
                        {t('sidebar_logout_confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );

    return (
        <>
        <aside className="w-64 min-h-screen bg-[#8B1A1A] flex flex-col hidden lg:flex fixed top-0 left-0 z-40">
            {/* Top Section */}
            <div className="bg-[#6e1515] p-6 flex flex-col items-center">
                {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="h-16 w-16 rounded-full object-cover border-2 border-[#E2B325] bg-white shadow-sm" />
                ) : (
                    <img src={defaultAvatar} alt="Default Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-[#E2B325] shadow-sm bg-white" />
                )}
                <h3 className="text-white font-semibold text-base mt-3 font-['DM_Sans'] text-center">
                    {user?.name || t(`role_labels.${role}`, { defaultValue: role.replace('_', ' ') })}
                </h3>
                <span className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-widest px-3 py-1 mt-1 rounded-sm shadow-sm">
                    {t(`role_labels.${role}`, { defaultValue: role.replace('_', ' ') })}
                </span>
            </div>

            {/* Nav Links Section */}
            <nav className="flex-1 flex flex-col overflow-y-auto">
                {currentNav.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/employer' && item.path !== '/admin' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full transition-colors cursor-pointer ${
                                isActive
                                    ? 'bg-[#E2B325] text-[#8B1A1A] hover:bg-[#E2B325] border-l-4 border-[#1A1A1A] font-bold'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Icon size={16} className={isActive ? 'text-[#8B1A1A]' : 'text-white/80'} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <div className="border-t border-white/10 my-3" />

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 w-full text-left"
                >
                    <LogOut size={16} />
                    <span>{t('nav_logout')}</span>
                </button>
            </nav>
        </aside>
        {logoutModal}
        </>
    );
};
