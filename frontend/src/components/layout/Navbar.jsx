import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { getInitials } from '../../utils/formatters';

const languages = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'ta', label: 'தமிழ்', full: 'Tamil' },
    { code: 'si', label: 'සිං', full: 'Sinhala' },
];

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const isActive = (path) => location.pathname === path;

    // Build nav items — hide HOME when logged in
    const navItems = [
        ...(!isAuthenticated ? [{ label: t('nav_home'), path: '/' }] : []),
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
                                className={`text-xs tracking-widest font-medium py-1 border-b-2 transition-colors ${isActive(item.path)
                                    ? 'border-brand-green text-brand-green'
                                    : 'border-transparent text-gray-500 hover:text-brand-dark'
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
                            <Link to="/register">
                                <Button variant="primary" size="sm">POST A JOB</Button>
                            </Link>
                        </>
                    ) : (
                        user?.role === 'ADMIN' ? (
                            <div className="flex items-center gap-3">
                                <button className="relative p-2 text-gray-400 hover:text-brand-dark transition-colors">
                                    <Bell size={18} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-green rounded-full border-2 border-white" />
                                </button>
                                <Link to="/profile">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="h-9 w-9 object-cover rounded-full border-2 border-[#8B1A1A] cursor-pointer" />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-[#8B1A1A] text-white text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-[#6e1515] transition-colors border-2 border-[#8B1A1A]" title="View Profile">
                                            {getInitials(user?.name)}
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative group">
                                <button className="relative p-2 text-gray-400 hover:text-brand-dark transition-colors">
                                    <Bell size={18} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-green rounded-full border-2 border-white" />
                                </button>

                                <Link to="/profile" className="flex items-center gap-2">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="h-9 w-9 object-cover rounded-full border-2 border-[#8B1A1A]" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center text-sm font-bold border-2 border-[#8B1A1A]">
                                            {getInitials(user?.name)}
                                        </div>
                                    )}
                                </Link>

                                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 origin-top-right">
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
                            {/* Language Switcher (mobile) — hidden for admin */}
                            {user?.role !== 'ADMIN' && (
                                <div className="flex justify-center">
                                    <LanguageSwitcher />
                                </div>
                            )}

                            {user?.role !== 'ADMIN' && (
                                <div className="flex flex-col gap-3">
                                    {navItems.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-xs tracking-widest font-medium py-2 px-2 transition-colors ${isActive(item.path) ? 'text-brand-green' : 'text-gray-500'
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

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
                                        <div className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">
                                            {getInitials(user?.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-brand-dark text-sm">{user?.name}</p>
                                            <p className="text-xs text-brand-green">{t('nav_dashboard')} →</p>
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
