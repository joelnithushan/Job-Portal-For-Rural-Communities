import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { LayoutDashboard, FileText, Heart, User, LogOut, PlusCircle, Briefcase, Users, Building, ClipboardList, Building2 } from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const role = user?.role || 'JOB_SEEKER';

    const navItems = {
        JOB_SEEKER: [
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'My Applications', path: '/dashboard/applications', icon: FileText },
            { label: 'Saved Jobs', path: '/dashboard/saved', icon: Heart },
            { label: 'Profile', path: '/dashboard/profile', icon: User },
        ],
        EMPLOYER: [
            { label: 'Dashboard', path: '/employer', icon: LayoutDashboard },
            { label: 'Post a Job', path: '/employer/post-job', icon: PlusCircle },
            { label: 'My Jobs', path: '/employer/jobs', icon: Briefcase },
            { label: 'Applications', path: '/employer/jobs', icon: ClipboardList },
            { label: 'Company Profile', path: '/employer/company', icon: Building2 },
            { label: 'My Profile', path: '/profile', icon: User },
        ],
        ADMIN: [
            { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { label: 'Users', path: '/admin/users', icon: Users },
            { label: 'Companies', path: '/admin/companies', icon: Building },
            { label: 'All Jobs', path: '/admin/jobs', icon: Briefcase },
            { label: 'My Profile', path: '/profile', icon: User },
        ]
    };

    const currentNav = navItems[role] || navItems.JOB_SEEKER;

    // ─── ADMIN SIDEBAR ────────────────────────────────────────────
    if (role === 'ADMIN') {
        return (
            <aside className="w-64 min-h-screen bg-[#8B1A1A] flex flex-col hidden lg:flex fixed top-0 left-0 z-40">
                {/* Admin Top Section */}
                <div className="bg-[#6e1515] p-6 flex flex-col items-center">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#E2B325]" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-[#E2B325] text-[#8B1A1A] flex items-center justify-center text-lg font-bold">
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <h3 className="text-white font-semibold text-base mt-3 font-['DM_Sans']">
                        {user?.name || 'Admin User'}
                    </h3>
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-widest px-3 py-0.5 mt-1">
                        ADMIN
                    </span>
                </div>

                {/* Nav Links Section */}
                <nav className="flex-1 flex flex-col overflow-y-auto">
                    <div className="text-[#E2B325]/60 text-xs uppercase tracking-widest px-4 pt-5 pb-2">
                        ADMINISTRATION
                    </div>
                    {currentNav.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full transition-colors cursor-pointer ${isActive
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
                        onClick={logout}
                        className="mt-auto flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 w-full text-left"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>

                    {/* Bottom help card */}
                    <div className="m-4 p-4 bg-[#6e1515] border border-white/10 flex flex-col gap-2">
                        <p className="text-white/70 text-xs">Need Help?</p>
                        <button className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-wider px-3 py-1.5 w-full">
                            SUPPORT
                        </button>
                    </div>
                </nav>
            </aside>
        );
    }

    // ─── EMPLOYER SIDEBAR ──────────────────────────────────────────
    if (role === 'EMPLOYER') {
        return (
            <aside className="w-64 min-h-screen bg-[#8B1A1A] flex flex-col hidden lg:flex fixed top-0 left-0 z-40">
                {/* Employer Top Section */}
                <div className="bg-[#6e1515] p-6 flex flex-col items-center">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="h-14 w-14 rounded-full object-cover border-2 border-[#E2B325]" />
                    ) : (
                        <div className="h-14 w-14 rounded-full bg-[#E2B325] text-[#8B1A1A] font-bold text-lg flex items-center justify-center">
                            {getInitials(user?.name)}
                        </div>
                    )}
                    <h3 className="text-white font-semibold text-base mt-3">
                        {user?.name || 'Employer'}
                    </h3>
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-widest px-3 py-0.5 mt-1">
                        EMPLOYER
                    </span>
                </div>

                {/* Nav Links Section */}
                <nav className="flex-1 flex flex-col overflow-y-auto">
                    <div className="text-[#E2B325]/60 text-xs uppercase tracking-widest px-4 pt-5 pb-2">
                        EMPLOYER PANEL
                    </div>
                    {currentNav.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/employer' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full transition-colors cursor-pointer ${isActive
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
                        onClick={logout}
                        className="mt-auto flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 w-full text-left"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>

                    {/* Bottom help card */}
                    <div className="bg-[#6e1515] border border-white/10 mx-3 mb-4 p-4">
                        <p className="text-white text-sm font-semibold">Need Help?</p>
                        <p className="text-white/60 text-xs mt-1">Our support team is ready to assist you.</p>
                        <button className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-wider px-3 py-1.5 w-full mt-3">
                            SUPPORT
                        </button>
                    </div>
                </nav>
            </aside>
        );
    }

    // ─── JOB SEEKER SIDEBAR (default) ──────────────────────────────
    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-xl border-r border-brand-green/10 flex flex-col pt-20 z-40 hidden lg:flex">

            {/* Profile Snippet */}
            <div className="p-6 text-center border-b border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white text-2xl font-heading font-bold mb-3 border-4 border-brand-sand">
                    {getInitials(user?.name)}
                </div>
                <h3 className="font-heading font-semibold text-lg text-brand-dark">{user?.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-brand-terra/10 text-brand-terra text-xs font-bold uppercase tracking-wider rounded-full">
                    {role.replace('_', ' ')}
                </span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
                {currentNav.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${isActive
                                ? 'text-brand-terra font-semibold'
                                : 'text-brand-muted hover:text-brand-terra hover:bg-brand-sand/50'
                                }`}
                        >
                            <Icon size={20} className={`z-10 ${isActive ? 'text-brand-terra' : 'text-brand-muted group-hover:text-brand-terra transition-colors'}`} />
                            <span className="z-10">{item.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="sidebarActive"
                                    className="absolute inset-0 bg-white shadow-sm border border-gray-100 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="my-4 border-t border-gray-100" />

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium focus:outline-none"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </nav>

            {/* Help Card */}
            <div className="p-4 m-4 bg-brand-sand rounded-xl text-center">
                <p className="text-sm font-semibold text-brand-dark mb-1">Need Help?</p>
                <p className="text-xs text-brand-muted mb-3">Our support team is ready to assist you.</p>
                <button className="w-full py-2 bg-white text-brand-green text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-shadow">
                    Contact Support
                </button>
            </div>

        </aside>
    );
};
