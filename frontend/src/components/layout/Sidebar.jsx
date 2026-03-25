import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { LayoutDashboard, FileText, Heart, User, LogOut, PlusCircle, Briefcase, Users, Building, ClipboardList, Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import defaultAvatar from '../../assets/default-avatar.png';

export const Sidebar = () => {
    const { user, logout } = useAuth();
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
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'My Applications', path: '/dashboard/applications', icon: FileText },
            { label: 'Saved Jobs', path: '/dashboard/saved', icon: Heart },
            { label: 'My Profile', path: '/profile', icon: User },
        ],
        EMPLOYER: [
            { label: 'Dashboard', path: '/employer', icon: LayoutDashboard },
            { label: 'Post a Job', path: '/employer/post-job', icon: PlusCircle },
            { label: 'My Jobs', path: '/employer/jobs', icon: Briefcase },
            { label: 'Applications', path: '/employer/jobs/:jobId/applications', icon: ClipboardList },
            { label: 'Company Profile', path: '/employer/company', icon: Building2 },
            { label: 'My Profile', path: '/profile', icon: User },
        ],
        ADMIN: [
            { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { label: 'Users', path: '/admin/users', icon: Users },
            { label: 'Companies', path: '/admin/companies', icon: Building },
            { label: 'All Jobs', path: '/admin/jobs', icon: Briefcase },
        ]
    };

    const currentNav = navItems[role] || navItems.JOB_SEEKER;
    const panelHeaders = {
        JOB_SEEKER: 'JOB SEEKER PANEL',
        EMPLOYER: 'EMPLOYER PANEL',
        ADMIN: 'ADMINISTRATION'
    };

    const logoutModal = (
        <Modal 
            isOpen={isLogoutModalOpen} 
            onClose={() => setIsLogoutModalOpen(false)}
            title="Confirm Sign Out"
            size="sm"
        >
            <div className="flex flex-col py-1">
                <p className="text-brand-dark mb-6 font-['DM_Sans'] text-sm">
                    Are you sure you want to sign out? You will need to log back in to access your dashboard.
                </p>
                <div className="flex justify-end gap-3 w-full">
                    <Button 
                        variant="outline" 
                        onClick={() => setIsLogoutModalOpen(false)}
                        className="rounded border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A]/10 font-['DM_Sans'] font-bold px-6 tracking-wide"
                    >
                        CANCEL
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={confirmLogout}
                        className="rounded bg-[#8B1A1A] border-[#8B1A1A] text-[#E2B325] hover:bg-[#6e1515] hover:border-[#6e1515] font-['DM_Sans'] font-bold px-6 tracking-wide"
                    >
                        SIGN OUT
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
                    <img src={user.profilePicture} alt={user.name} className="h-16 w-16 rounded-full object-cover border-2 border-[#E2B325]" />
                ) : (
                    <img src={defaultAvatar} alt="Default Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-[#E2B325] shadow-sm bg-white" />
                )}
                <h3 className="text-white font-semibold text-base mt-3 font-['DM_Sans'] text-center">
                    {user?.name || role.replace('_', ' ')}
                </h3>
                <span className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-widest px-3 py-1 mt-1 rounded-sm shadow-sm">
                    {role.replace('_', ' ')}
                </span>
            </div>

            {/* Nav Links Section */}
            <nav className="flex-1 flex flex-col overflow-y-auto">
                <div className="text-[#E2B325]/60 text-xs uppercase tracking-widest px-4 pt-5 pb-2">
                    {panelHeaders[role]}
                </div>
                {currentNav.map((item) => {
                    // Specific path matching to prevent false positives for shorter prefixes
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
                    <span>Sign Out</span>
                </button>
            </nav>
        </aside>
        {logoutModal}
        </>
    );
};
