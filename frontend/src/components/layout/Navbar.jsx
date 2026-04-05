import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { getInitials } from '../../utils/formatters';
import { adminAPI, notificationsAPI } from '../../api/services';
const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';

const languages = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'ta', label: 'தமிழ்', full: 'Tamil' },
    { code: 'si', label: 'සිං', full: 'Sinhala' },
];

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (isAuthenticated) {
            const fetchNotifications = async () => {
                try {
                    let res;
                    if (user?.role === 'ADMIN') {
                        res = await adminAPI.getNotifications();
                    } else {
                        res = await notificationsAPI.getMyNotifications();
                    }
                    if (res?.success) {
                        setNotifications(res.data.notifications);
                    }
                } catch (err) {
                    console.error('Failed to fetch notifications', err);
                }
            };
            fetchNotifications();
            
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user?.role]);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationsAPI.markAsRead(notif._id);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Failed to mark notification as read', error);
            }
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const isActive = (path) => location.pathname === path;

    const isSeeker = isAuthenticated && user?.role === 'JOB_SEEKER';

    // Build nav items for desktop
    const navItems = [
        ...(!isAuthenticated ? [{ label: t('nav_home'), path: '/' }] : []),
        ...(isSeeker ? [
            { label: t('dashboard'), path: '/dashboard' },
            { label: 'Discover Jobs', path: '/dashboard/discover' },
            { label: t('my_applications'), path: '/dashboard/applications' },
            { label: t('saved_jobs'), path: '/dashboard/saved' }
        ] : []),
        { label: t('nav_jobs'), path: '/jobs' },
        { label: t('nav_companies'), path: '/companies' },
    ];

    // Build nav items for mobile
    const mobileNavItems = [
        ...(!isAuthenticated ? [{ label: t('nav_home'), path: '/' }] : []),
        ...(isSeeker ? [
            { label: t('dashboard'), path: '/dashboard' },
            { label: 'Discover Jobs', path: '/dashboard/discover' },
            { label: t('my_applications'), path: '/dashboard/applications' },
            { label: t('saved_jobs'), path: '/dashboard/saved' }
        ] : []),
        ...(user?.role === 'EMPLOYER' ? [
            { label: 'Dashboard', path: '/employer' },
            { label: 'Post a Job', path: '/employer/post-job' },
            { label: 'My Jobs', path: '/employer/jobs' },
            { label: 'Company Profile', path: '/employer/company' },
        ] : []),
        ...(user?.role === 'ADMIN' ? [
            { label: 'Dashboard', path: '/admin' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Companies', path: '/admin/companies' },
            { label: 'All Jobs', path: '/admin/jobs' },
        ] : []),
        { label: t('nav_jobs'), path: '/jobs' },
        { label: t('nav_companies'), path: '/companies' },
    ];

    const LanguageSwitcher = () => (
        <div className="flex items-center border border-gray-200">
            {languages.map((lang, idx) => (
                <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    title={lang.full}
                    className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${idx < languages.length - 1 ? 'border-r border-gray-200' : ''} ${i18n.language?.startsWith(lang.code)
                        ? 'bg-[#8B1A1A] text-white'
                        : 'text-gray-500 hover:text-[#8B1A1A]'
                        }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16 md:h-[72px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">

                {/* Logo */}
                <Link to={user?.role === 'ADMIN' ? '/admin' : '/'} className="flex items-center shrink-0">
                    <img src="/logo.png" alt="RuralWork" className="h-14 md:h-16 w-auto object-contain" />
                </Link>

                {/* Desktop Nav — hide for admins */}
                {user?.role !== 'ADMIN' && (
                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-xs tracking-widest font-bold py-1 border-b-2 transition-colors uppercase ${isActive(item.path)
                                    ? 'border-[#E2B325] text-[#8B1A1A]'
                                    : 'border-transparent text-gray-500 hover:text-[#8B1A1A]'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Language Switcher — hidden for admin */}
                    {user?.role !== 'ADMIN' && <LanguageSwitcher />}

                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="text-xs tracking-widest font-medium text-gray-500 hover:text-brand-dark transition-colors px-3 py-2">
                                SIGN IN
                            </Link>
                            <Link to="/register/employer">
                                <Button variant="primary" size="sm">POST A JOB</Button>
                            </Link>
                        </>
                    ) : (
                        user?.role === 'ADMIN' ? (
                            <div className="flex items-center gap-3">
                                <div className="relative group/adminnotif">
                                    <div className="relative p-2 text-gray-400 hover:text-[#8B1A1A] transition-colors cursor-pointer">
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E2B325] rounded-full border-2 border-white" />
                                        )}
                                    </div>

                                    {/* Notifications Dropdown */}
                                    <div className="absolute right-0 top-full mt-1 w-80 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover/adminnotif:opacity-100 group-hover/adminnotif:visible transition-all duration-200 origin-top-right z-50">
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-semibold text-brand-dark text-sm">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <span className="bg-[#8B1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllAsRead} className="text-[10px] text-[#8B1A1A] hover:underline hover:text-[#6e1515] font-semibold uppercase tracking-wider cursor-pointer">
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No new notifications
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <Link 
                                                        key={notification._id} 
                                                        to={notification.link || '#'}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`block p-3 border-b border-gray-50 transition-colors last:border-b-0 ${!notification.isRead ? 'bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm text-brand-dark font-medium">{notification.title}</p>
                                                            {!notification.isRead && <span className="w-2 h-2 rounded-full bg-[#8B1A1A] mt-1.5 flex-shrink-0"></span>}
                                                        </div>
                                                        <p className="text-xs text-brand-muted line-clamp-2">{notification.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link to="/profile">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="h-9 w-9 object-cover rounded-full border-2 border-[#8B1A1A] cursor-pointer" />
                                    ) : (
                                        <img src={defaultAvatar} alt="Default Avatar" title="View Profile" className="h-9 w-9 object-cover rounded-full border-2 border-[#8B1A1A] cursor-pointer bg-white" />
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {/* Notifications Dropdown */}
                                <div className="relative group/notif">
                                    <div className="relative p-2 text-gray-400 hover:text-[#8B1A1A] transition-colors cursor-pointer">
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E2B325] rounded-full border-2 border-white" />
                                        )}
                                    </div>

                                    <div className="absolute right-0 top-full mt-1 w-80 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover/notif:opacity-100 group-hover/notif:visible transition-all duration-200 origin-top-right z-50">
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-semibold text-brand-dark text-sm">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <span className="bg-[#8B1A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                                {unreadCount > 0 && (
                                                    <button onClick={handleMarkAllAsRead} className="text-[10px] text-[#8B1A1A] hover:underline hover:text-[#6e1515] font-semibold uppercase tracking-wider cursor-pointer">
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No new notifications
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <Link 
                                                        key={notification._id} 
                                                        to={notification.link || '#'}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`block p-3 border-b border-gray-50 transition-colors last:border-b-0 ${!notification.isRead ? 'bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm text-brand-dark font-medium">{notification.title}</p>
                                                            {!notification.isRead && <span className="w-2 h-2 rounded-full bg-[#8B1A1A] mt-1.5 flex-shrink-0"></span>}
                                                        </div>
                                                        <p className="text-xs text-brand-muted line-clamp-2">{notification.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            {new Date(notification.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative group/profile">
                                    <Link to="/profile" className="flex items-center gap-2">
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="h-9 w-9 object-cover rounded-full border-2 border-[#E2B325] bg-white shadow-sm" />
                                        ) : (
                                            <img src={defaultAvatar} alt="Default Avatar" className="h-9 w-9 object-cover rounded-full border-2 border-[#E2B325] bg-white shadow-sm" />
                                        )}
                                    </Link>

                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-150 origin-top-right z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="font-semibold text-brand-dark text-sm truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                                        </div>
                                        <div className="p-1.5 flex flex-col">
                                            <Link to="/profile" className="px-3 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors flex items-center gap-2">
                                                <User size={14} /> My Profile
                                            </Link>
                                            <Link to={user?.role === 'EMPLOYER' ? '/employer' : '/dashboard'} className="px-3 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors">
                                                {t('nav_dashboard')}
                                            </Link>
                                            <button onClick={logout} className="px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors w-full">
                                                {t('nav_logout')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-brand-dark"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
                    >
                        <div className="px-4 py-6 flex flex-col gap-5">
                            {/* Language Switcher (mobile) */}
                            {user?.role !== 'ADMIN' && (
                                <div className="flex justify-center">
                                    <LanguageSwitcher />
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {mobileNavItems.map(item => {
                                    const isItemActive = isActive(item.path) || 
                                        (item.path !== '/' && item.path !== '/dashboard' && item.path !== '/employer' && item.path !== '/admin' && location.pathname.startsWith(item.path));
                                    
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-xs tracking-widest font-bold py-2 px-2 transition-colors uppercase ${
                                                isItemActive ? 'text-[#8B1A1A] bg-[#FAF7F2]' : 'text-gray-500'
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="h-px bg-gray-100 w-full" />

                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" fullWidth className="text-brand-dark border border-gray-200">Sign In</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" fullWidth>Create Account</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <Link to={user?.role === 'EMPLOYER' ? '/employer' : user?.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-[#E2B325] bg-white shadow-sm" />
                                        ) : (
                                            <img src={defaultAvatar} alt="Default Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[#E2B325] bg-white shadow-sm" />
                                        )}
                                        <div>
                                            <p className="font-bold text-[#1A1A1A] text-sm">{user?.name}</p>
                                            <p className="text-[10px] text-[#8B1A1A] font-bold uppercase tracking-widest">{t('nav_dashboard')} →</p>
                                        </div>
                                    </Link>
                                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-medium text-xs p-2 hover:bg-red-50">
                                        {t('nav_logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
