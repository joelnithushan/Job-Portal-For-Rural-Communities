import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Users, Briefcase, UserCheck, FileText, ClipboardList,
    Building2, Clock, ShieldOff, BarChart2, AlertTriangle,
    Search, X, CheckCircle, XCircle, Lock
} from 'lucide-react';
import { adminAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';

// ─── SHARED HELPERS ────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        ACTIVE: 'bg-[#E2B325] text-[#8B1A1A]',
        SUSPENDED: 'bg-[#8B1A1A] text-white',
        OPEN: 'bg-[#E2B325] text-[#8B1A1A]',
        CLOSED: 'bg-gray-200 text-gray-600',
        APPLIED: 'bg-blue-600 text-white',
        REVIEWED: 'bg-[#E2B325] text-[#8B1A1A]',
        ACCEPTED: 'bg-green-700 text-white',
        REJECTED: 'bg-[#8B1A1A] text-white',
        PENDING: 'bg-orange-500 text-white',
        VERIFIED: 'bg-green-700 text-white',
    };
    const { t } = useTranslation();
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-200 text-gray-600'}`}>
            {t(`status_labels.${status}`, { defaultValue: status })}
        </span>
    );
};

const RoleBadge = ({ role }) => {
    const map = {
        ADMIN: 'bg-[#8B1A1A] text-white',
        EMPLOYER: 'bg-[#1A1A1A] text-white',
        JOB_SEEKER: 'bg-[#E2B325] text-[#8B1A1A]',
    };
    const { t } = useTranslation();
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[role] || 'bg-gray-200 text-gray-600'}`}>
            {t(`role_labels.${role}`, { defaultValue: role?.replace('_', ' ') })}
        </span>
    );
};

const Spinner = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
            <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading', { defaultValue: 'Loading...' })}</p>
        </div>
    );
};

const EmptyState = ({ message }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-300 text-2xl">—</span>
            </div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-2">
                {message || t('no_records_found')}
            </p>
            <p className="text-xs text-gray-300">{t('jobs_empty_desc')}</p>
        </div>
    );
};

const SectionCard = ({ children, className = '', title, subtitle }) => (
    <div className={`bg-white border border-gray-200 border-l-4 border-l-[#8B1A1A] p-0 mb-6 overflow-hidden ${className}`}>
        {title && (
            <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest font-['DM_Sans']">
                    {title}
                </h2>
                {subtitle && <span className="text-[#E2B325] text-xs">{subtitle}</span>}
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

const PageHeading = ({ title, subtitle, right }) => (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            {/* Minimal heading */}
        </div>
        {right && <div>{right}</div>}
    </div>
);

const StatCard = ({ label, value, icon: Icon, accent }) => (
    <div
        className="bg-white border border-gray-200 p-5 flex items-start justify-between"
        style={{ borderLeft: `4px solid ${accent}` }}
    >
        <div className="flex flex-col justify-between h-full">
            <span
                className="text-3xl font-bold text-[#1A1A1A] leading-none"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
                {value}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">
                {label}
            </span>
        </div>
        <div
            className="p-3 flex items-center justify-center flex-shrink-0 ml-4"
            style={{ backgroundColor: accent + '20' }}
        >
            <Icon className="h-6 w-6" style={{ color: accent }} />
        </div>
    </div>
);

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const fmtDate = (d, i18n) => {
    return formatDate(d, i18n);
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'DELETE', requireReason = false }) => {
    const [reason, setReason] = useState('');
    
    const { t } = useTranslation();
    
    // Reset reason when modal opens
    useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-[100] flex items-center justify-center p-4">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] p-6 max-w-sm w-full shadow-2xl">
                <h3 className="font-heading text-lg text-[#1A1A1A] font-bold">{title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                
                {requireReason && (
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            {t('reason_suspension', { defaultValue: 'Reason for Suspension' })} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#8B1A1A] placeholder-gray-400 resize-none"
                            rows={3}
                            placeholder={t('explain_why', { defaultValue: 'Please explain why...' })}
                            required
                        />
                    </div>
                )}
                
                <div className="mt-6 flex gap-3 justify-end">
                    <button 
                        onClick={onCancel} 
                        className="bg-gray-100 border border-gray-300 px-4 py-2 text-sm font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={() => onConfirm(reason)} 
                        disabled={loading || (requireReason && !reason.trim())} 
                        className="bg-[#8B1A1A] border border-[#8B1A1A] text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-[#6e1515] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {loading ? t('wait') : (confirmText === 'DELETE' ? t('delete') : confirmText).toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 1: ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const AdminDashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            const results = await Promise.allSettled([
                adminAPI.getUsers(),
                adminAPI.getJobs(),
                adminAPI.getApplications(),
                adminAPI.getAdminCompanies(),
            ]);

            // Users
            if (results[0].status === 'fulfilled') {
                const d = results[0].value;
                setUsers(d?.data?.users || d?.users || []);
            }

            // Jobs
            if (results[1].status === 'fulfilled') {
                const d = results[1].value;
                setJobs(d?.data?.jobs || d?.jobs || []);
            }

            // Applications — silently ignore if endpoint doesn't exist
            if (results[2].status === 'fulfilled') {
                const d = results[2].value;
                setApplications(d?.data?.applications || d?.applications || []);
            }

            // Companies — silently ignore if endpoint doesn't exist
            if (results[3].status === 'fulfilled') {
                const d = results[3].value;
                setCompanies(d?.data?.companies || d?.companies || []);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    // Derived stats
    const totalUsers = users.length;
    const totalEmployers = users.filter(u => u.role === 'EMPLOYER').length;
    const totalSeekers = users.filter(u => u.role === 'JOB_SEEKER').length;
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
    const openJobs = jobs.filter(j => j.status === 'OPEN').length;
    const totalApplications = applications.length;
    const acceptedApps = applications.filter(a => a.status === 'ACCEPTED').length;
    const rejectedApps = applications.filter(a => a.status === 'REJECTED').length;
    const totalCompanies = companies.length;
    const pendingVerify = companies.filter(c => c.verificationStatus === 'PENDING').length;

    const dateString = new Date().toLocaleDateString(document.documentElement.lang === 'si' ? 'si-LK' : document.documentElement.lang === 'ta' ? 'ta-LK' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const statCards = [
        { label: t('total_users'), value: totalUsers, icon: Users, accent: '#8B1A1A' },
        { label: t('employers'), value: totalEmployers, icon: Briefcase, accent: '#1e40af' },
        { label: t('job_seekers'), value: totalSeekers, icon: UserCheck, accent: '#E2B325' },
        { label: t('active_jobs'), value: openJobs, icon: FileText, accent: '#8B1A1A' },
        { label: t('total_applications'), value: totalApplications, icon: ClipboardList, accent: '#E2B325' },
        { label: t('all_companies'), value: totalCompanies, icon: Building2, accent: '#1e40af' },
        { label: t('pending_verify', { defaultValue: 'Pending Verify' }), value: pendingVerify, icon: Clock, accent: '#f97316' },
        { label: t('suspend'), value: suspendedUsers, icon: ShieldOff, accent: '#dc2626' },
    ];

    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeading title={t('admin_dashboard')} subtitle={t('platform_overview_desc', { defaultValue: 'Platform overview and management' })} right={
                <p className="text-[#E2B325] text-xs uppercase tracking-wider">{dateString}</p>
            } />

            {/* Pending Verification Alert */}
            {pendingVerify > 0 && (
                <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex md:flex-row flex-col gap-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-[#8B1A1A] h-5 w-5" />
                        <p className="text-[#8B1A1A] text-sm font-semibold">
                            {pendingVerify} {t('companies_awaiting', { defaultValue: 'company verifications awaiting review' })}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/companies')}
                        className="bg-[#8B1A1A] text-white text-xs font-bold uppercase tracking-widest px-6 py-2 hover:bg-[#6e1515] transition-colors shadow-sm"
                    >
                        {t('review_now').toUpperCase()}
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map(s => (
                    <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
                ))}
            </div>

            {/* Two Column: Recent Users + Recent Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Recent Users */}
                <SectionCard
                    title={t('recent_registrations')}
                    subtitle={
                        <Link to="/admin/users" className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-widest px-3 py-1 hover:bg-[#d1a620] transition-colors">
                            {t('view_all_users').toUpperCase()}
                        </Link>
                    }
                >
                    {recentUsers.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4 text-center pb-0">{t('no_users_yet', { defaultValue: 'No users yet.' })}</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentUsers.map(u => (
                                <div key={u._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                                    {u.profilePicture ? (
                                        <img src={u.profilePicture} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <img src={defaultAvatar} alt="Default Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 bg-white" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-[#1A1A1A] text-sm">{u.name}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1">
                                        <RoleBadge role={u.role} />
                                        <div className="flex flex-col items-end">
                                            <StatusBadge status={u.status} />
                                            {u.status === 'SUSPENDED' && u.suspensionReason && (
                                                <span className="text-[9px] text-[#8B1A1A] font-bold mt-0.5" title={u.suspensionReason}>{t('reason_attached', { defaultValue: 'Reason attached' })}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-300">{fmtDate(u.createdAt, i18n)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Recent Jobs */}
                <SectionCard
                    title={t('recent_job_posts')}
                    subtitle={<Link to="/admin/jobs" className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-widest px-3 py-1 hover:bg-[#d1a620] transition-colors">{t('all_jobs').toUpperCase()}</Link>}
                >
                    {recentJobs.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4 text-center pb-0">{t('no_jobs_posted_yet', { defaultValue: 'No jobs posted yet.' })}</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentJobs.map(j => (
                                <div key={j._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-semibold text-[#1A1A1A] text-sm">{j.title}</p>
                                        <p className="text-xs text-gray-400">{j.district} · {j.category}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <StatusBadge status={j.status} />
                                        <p className="text-xs text-gray-300">{fmtDate(j.createdAt, i18n)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Quick Actions */}
            <SectionCard title={t('quick_actions_admin')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#8B1A1A] p-4 text-center">
                        <Users className="h-8 w-8 mb-3 mx-auto text-[#8B1A1A]" />
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">{t('manage_users')}</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-4">{t('manage_users_desc', { defaultValue: 'View, suspend, or activate accounts' })}</p>
                        <button onClick={() => navigate('/admin/users')} className="w-full bg-[#8B1A1A] text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-[#6e1515] transition-colors shadow-sm">
                            {t('manage_users').toUpperCase()}
                        </button>
                    </div>
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#E2B325] p-4 text-center">
                        <Building2 className="h-8 w-8 mb-3 mx-auto text-[#E2B325]" />
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">{t('verify_companies')}</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-4">{t('verify_companies_desc', { defaultValue: 'Review pending company verifications' })}</p>
                        <button onClick={() => navigate('/admin/companies')} className="w-full bg-[#8B1A1A] text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-[#6e1515] transition-colors shadow-sm">
                            {t('verify_companies').toUpperCase()}
                        </button>
                    </div>
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#1e40af] p-4 text-center flex flex-col justify-between">
                        <div>
                            <BarChart2 className="h-8 w-8 mb-3 mx-auto text-[#1e40af]" />
                            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">{t('platform_stats')}</h3>
                            <p className="text-xs text-gray-400 mt-1 mb-4">{t('platform_stats_desc', { defaultValue: 'Application processing summary' })}</p>
                        </div>
                        <div className="text-left w-full mt-auto">
                            <div className="flex justify-between border-b border-gray-100 py-2 text-xs">
                                <span className="text-gray-600">{t('accepted_apps', { defaultValue: 'Accepted Applications' })}</span>
                                <span className="text-green-700 font-bold">{acceptedApps}</span>
                            </div>
                            <div className="flex justify-between py-2 text-xs">
                                <span className="text-gray-600">{t('rejected_apps', { defaultValue: 'Rejected Applications' })}</span>
                                <span className="text-[#8B1A1A] font-bold">{rejectedApps}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 2: ADMIN USERS PAGE
// ═══════════════════════════════════════════════════════════════

export const AdminUsersPage = () => {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, newStatus: null, userName: '' });
    const [viewUserModal, setViewUserModal] = useState({ isOpen: false, user: null });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminAPI.getUsers();
                setUsers(res?.data?.users || res?.users || []);
            } catch (err) {
                if (err.response?.status !== 404) {
                    toast.error(err.response?.data?.message || t('error_load_users', { defaultValue: 'Failed to load users.' }));
                }
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchSearch = !searchTerm ||
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
            return matchSearch && matchRole && matchStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleUserStatus = async (userId, newStatus, reason) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await adminAPI.updateUserStatus(userId, { status: newStatus, reason });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus, suspensionReason: reason || null } : u));
            toast.success(newStatus === 'SUSPENDED' ? t('user_suspended_success', { defaultValue: 'User suspended.' }) : t('user_activated_success', { defaultValue: 'User activated.' }));
            setConfirmModal({ isOpen: false, userId: null, newStatus: null, userName: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || t('error_status_update'));
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const totalEmployers = users.filter(u => u.role === 'EMPLOYER').length;
    const totalSeekers = users.filter(u => u.role === 'JOB_SEEKER').length;
    const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;

    if (loading) return <Spinner />;
    if (error) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-bold text-[#8B1A1A] uppercase tracking-wider">{t('error_load_users', { defaultValue: 'Failed to load users. Try refreshing.' })}</p>
        </div>
    );

    return (
        <div className="flex flex-col flex-1">
            <PageHeading
                title={t('user_management')}
                subtitle={`${users.length} ${t('total_users')}`}
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_users_ph', { defaultValue: 'Search by name or email...' })}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white transition-colors"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('all_roles', { defaultValue: 'All Roles' })}</option>
                    <option value="ADMIN">{t('role_labels.ADMIN')}</option>
                    <option value="EMPLOYER">{t('role_labels.EMPLOYER')}</option>
                    <option value="JOB_SEEKER">{t('role_labels.JOB_SEEKER')}</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('all_status', { defaultValue: 'All Status' })}</option>
                    <option value="ACTIVE">{t('status_labels.ACTIVE')}</option>
                    <option value="SUSPENDED">{t('status_labels.SUSPENDED')}</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    {t('showing')} {filteredUsers.length} {t('of')} {users.length}
                </div>
            </div>

            {/* Users Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title={t('all_users')}
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredUsers.length}
                    </span>
                }
            >
                {filteredUsers.length === 0 ? (
                    <EmptyState message={t('no_users_match', { defaultValue: 'No users match your filters' })} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('user').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('role').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('status').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">{t('joined_date', { defaultValue: 'JOINED' })}</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">{t('actions').toUpperCase()}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, i) => (
                                    <tr key={user._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] transition-colors ${i === filteredUsers.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono border-b border-gray-100 align-middle">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <div className="flex items-center gap-3">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <img src={defaultAvatar} alt="Default Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 bg-white" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-[#1A1A1A]">{user.name}</span>
                                                    <span className="text-xs text-gray-400">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle"><RoleBadge role={user.role} /></td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <StatusBadge status={user.status} />
                                            {user.status === 'SUSPENDED' && user.suspensionReason && (
                                                <div className="text-[10px] text-[#8B1A1A] font-semibold mt-1 max-w-[120px] leading-tight" title={user.suspensionReason}>
                                                    {t('reason')}: {user.suspensionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs font-mono hidden md:table-cell border-b border-gray-100 align-middle">{fmtDate(user.createdAt, i18n)}</td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100 align-middle">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                <button
                                                    onClick={() => setViewUserModal({ isOpen: true, user })}
                                                    className="px-3 py-1 text-xs uppercase tracking-wider border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                                                >
                                                    {t('view').toUpperCase()}
                                                </button>
                                                {user.role === 'ADMIN' ? (
                                                    <span className="text-gray-400 text-[10px] flex items-center justify-end gap-1 font-bold uppercase tracking-widest ml-1 bg-gray-100 px-2 py-1 border border-gray-200">
                                                        <Lock size={10} /> {t('protected', { defaultValue: 'Protected' })}
                                                    </span>
                                                ) : (
                                                    user.status === 'ACTIVE' ? (
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, userId: user._id, newStatus: 'SUSPENDED', userName: user.name })}
                                                            disabled={actionLoading[user._id]}
                                                            className="px-3 py-1 text-xs uppercase tracking-wider border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-bold disabled:opacity-50"
                                                        >
                                                            {actionLoading[user._id] ? <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" /> : t('suspend').toUpperCase()}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmModal({ isOpen: true, userId: user._id, newStatus: 'ACTIVE', userName: user.name })}
                                                            disabled={actionLoading[user._id]}
                                                            className="px-3 py-1 text-xs uppercase tracking-wider border border-green-600 text-green-700 bg-green-50 hover:bg-green-100 transition-colors font-bold disabled:opacity-50"
                                                        >
                                                            {actionLoading[user._id] ? <div className="animate-spin h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full" /> : t('activate_btn', { defaultValue: 'ACTIVATE' })}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6 mt-auto">
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('total')} <span className="text-[#E2B325] font-bold ml-1">{users.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('employers')} <span className="text-[#E2B325] font-bold ml-1">{totalEmployers}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('job_seekers')} <span className="text-[#E2B325] font-bold ml-1">{totalSeekers}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('suspend')} <span className="text-[#E2B325] font-bold ml-1">{suspendedCount}</span>
                </span>
            </div>

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.newStatus === 'SUSPENDED' ? t('suspend_account_title', { defaultValue: 'Suspend Account' }) : t('activate_account_title', { defaultValue: 'Activate Account' })}
                message={confirmModal.newStatus === 'SUSPENDED' ? t('suspend_user_msg', { name: confirmModal.userName }) : t('activate_user_msg', { name: confirmModal.userName })}
                confirmText={confirmModal.newStatus === 'SUSPENDED' ? t('suspend').toUpperCase() : t('activate_btn', { defaultValue: 'ACTIVATE' })}
                loading={confirmModal.userId ? actionLoading[confirmModal.userId] : false}
                requireReason={confirmModal.newStatus === 'SUSPENDED'}
                onCancel={() => setConfirmModal({ isOpen: false, userId: null, newStatus: null, userName: '' })}
                onConfirm={(reason) => handleUserStatus(confirmModal.userId, confirmModal.newStatus, reason)}
            />

            <Modal
                isOpen={viewUserModal.isOpen}
                onClose={() => setViewUserModal({ isOpen: false, user: null })}
                title={t('user_profile_details', { defaultValue: 'User Profile Details' })}
                size="md"
            >
                {viewUserModal.user && (
                    <div className="flex flex-col py-2">
                        <div className="flex items-start gap-4 mb-6">
                            {viewUserModal.user.profilePicture ? (
                                <img src={viewUserModal.user.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                            ) : (
                                <img src={defaultAvatar} alt="Default Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 bg-white" />
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-[#1A1A1A]">{viewUserModal.user.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{viewUserModal.user.email}</p>
                                <div className="flex gap-2">
                                    <RoleBadge role={viewUserModal.user.role} />
                                    <StatusBadge status={viewUserModal.user.status} />
                                </div>
                            </div>
                        </div>
                        
                        {viewUserModal.user.status === 'SUSPENDED' && viewUserModal.user.suspensionReason && (
                            <div className="mb-4 p-4 border border-red-200 bg-red-50 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#8B1A1A]">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-bold text-xs uppercase tracking-wider">{t('reason_suspension')}</span>
                                </div>
                                <p className="text-sm text-red-900 leading-relaxed font-medium">
                                    {viewUserModal.user.suspensionReason}
                                </p>
                            </div>
                        )}
                        
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('joined_date')}</span>
                                <span className="font-medium text-[#1A1A1A]">{fmtDate(viewUserModal.user.createdAt, i18n)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('user_id', { defaultValue: 'User ID' })}</span>
                                <span className="font-mono text-xs text-gray-400">{viewUserModal.user._id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('authentication', { defaultValue: 'Authentication' })}</span>
                                <span className="font-medium text-[#1A1A1A]">
                                    {viewUserModal.user.googleId ? t('google_account', { defaultValue: 'Google Account' }) : t('email_password', { defaultValue: 'Email / Password' })}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={() => setViewUserModal({ isOpen: false, user: null })}
                                className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-6 py-2 uppercase tracking-widest hover:bg-gray-200 transition-colors font-bold shadow-sm"
                            >
                                {t('close').toUpperCase()}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 3: ADMIN COMPANIES PAGE
// ═══════════════════════════════════════════════════════════════

export const AdminCompaniesPage = () => {
    const { t, i18n } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifyFilter, setVerifyFilter] = useState('ALL');
    const [suspendFilter, setSuspendFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState({});
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, companyId: null, isCurrentlySuspended: false, companyName: '' });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await adminAPI.getAdminCompanies();
                setCompanies(res?.data?.companies || res?.companies || []);
            } catch (err) {
                if (err.response?.status !== 404) {
                    toast.error(err.response?.data?.message || 'Failed to load companies.');
                }
                setCompanies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filteredCompanies = useMemo(() => {
        return companies.filter(c => {
            const matchSearch = !searchTerm ||
                c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.employerUserId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchVerify = verifyFilter === 'ALL' || c.verificationStatus === verifyFilter;
            const matchSuspend =
                suspendFilter === 'ALL' ||
                (suspendFilter === 'ACTIVE' && !c.isSuspended) ||
                (suspendFilter === 'SUSPENDED' && c.isSuspended);
            return matchSearch && matchVerify && matchSuspend;
        });
    }, [companies, searchTerm, verifyFilter, suspendFilter]);

    const pendingCount = companies.filter(c => c.verificationStatus === 'PENDING').length;
    const verifiedCount = companies.filter(c => c.verificationStatus === 'VERIFIED').length;
    const suspendedCount = companies.filter(c => c.isSuspended).length;

    const handleVerify = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await adminAPI.verifyCompany(id);
            setCompanies(prev => prev.map(c => c._id === id ? { ...c, verificationStatus: 'VERIFIED' } : c));
            toast.success(t('company_verified_success', { defaultValue: 'Company verified successfully.' }));
            if (selectedCompany?._id === id) setSelectedCompany(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify company.');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSuspendToggle = async (id, isSuspended, reason) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await adminAPI.suspendCompany(id, reason);
            setCompanies(prev => prev.map(c => c._id === id ? { ...c, isSuspended: !c.isSuspended, suspensionReason: reason || null } : c));
            toast.success(isSuspended ? t('company_unsuspended_success', { defaultValue: 'Company unsuspended.' }) : t('company_suspended_success', { defaultValue: 'Company suspended.' }));
            setConfirmModal({ isOpen: false, companyId: null, isCurrentlySuspended: false, companyName: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update company.');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="flex flex-col flex-1">
            <PageHeading
                title={t('company_management', { defaultValue: 'Company Management' })}
                subtitle={`${companies.length} ${t('companies_registered', { defaultValue: 'companies registered' })}`}
            />

            {/* Pending Alert */}
            {pendingCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 mb-5 border-l-4 border-[#8B1A1A] bg-[#E2B325]">
                    <AlertTriangle className="text-[#8B1A1A] h-5 w-5" />
                    <span className="text-sm text-[#8B1A1A] font-semibold">
                        {t('company_verifications_pending', { count: pendingCount })}
                    </span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_companies_ph', { defaultValue: 'Search by name or owner...' })}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white transition-colors"
                    />
                </div>
                <select
                    value={verifyFilter}
                    onChange={e => setVerifyFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('filter_all')}</option>
                    <option value="PENDING">{t('status_labels.PENDING')}</option>
                    <option value="VERIFIED">{t('status_labels.VERIFIED')}</option>
                    <option value="REJECTED">{t('status_labels.REJECTED')}</option>
                </select>
                <select
                    value={suspendFilter}
                    onChange={e => setSuspendFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('all_suspension')}</option>
                    <option value="ACTIVE">{t('status_labels.ACTIVE')}</option>
                    <option value="SUSPENDED">{t('status_labels.SUSPENDED')}</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    {t('showing')} {filteredCompanies.length} {t('of')} {companies.length}
                </div>
            </div>

            {/* Companies Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title={t('all_companies')}
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredCompanies.length}
                    </span>
                }
            >
                {filteredCompanies.length === 0 ? (
                    <EmptyState message={t('no_companies_found', { defaultValue: 'No companies match your filters' })} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('company').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">{t('owner')}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden lg:table-cell">{t('district').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('verification', { defaultValue: 'VERIFICATION' })}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden sm:table-cell">{t('suspend').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">{t('actions').toUpperCase()}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompanies.map((company, i) => (
                                    <tr key={company._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] transition-colors ${i === filteredCompanies.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono border-b border-gray-100 align-middle">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <p className="font-semibold text-[#1A1A1A]">{company.businessName}</p>
                                            {company.description && (
                                                <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">
                                                    {company.description}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => setSelectedCompany(company)}
                                                className="text-[10px] bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 px-2 py-0.5 mt-2 uppercase tracking-widest font-bold transition-colors"
                                            >
                                                {t('view').toUpperCase()}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell border-b border-gray-100 align-middle">
                                            {company.employerUserId ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-[#1A1A1A]">{company.employerUserId.name}</span>
                                                    <span className="text-xs text-gray-400">{company.employerUserId.email}</span>
                                                </div>
                                            ) : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm hidden lg:table-cell border-b border-gray-100 align-middle">
                                            {company.district}
                                            {company.town && <div className="text-xs text-gray-400">{company.town}</div>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <StatusBadge status={company.isSuspended ? 'SUSPENDED' : 'ACTIVE'} />
                                            {company.isSuspended && company.suspensionReason && (
                                                <div className="text-[10px] text-[#8B1A1A] font-semibold mt-1 max-w-[120px] leading-tight" title={company.suspensionReason}>
                                                    {t('reason_suspension')}: {company.suspensionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 hidden sm:table-cell border-b border-gray-100 align-middle">
                                            {company.isSuspended ? (
                                                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">{t('yes', { defaultValue: 'YES' })}</span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100 align-middle">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                {(company.verificationStatus === 'PENDING' || company.verificationStatus === 'REJECTED') && (
                                                    <button
                                                        onClick={() => handleVerify(company._id)}
                                                        disabled={actionLoading[company._id]}
                                                        className="text-[10px] px-3 py-1 font-bold uppercase tracking-widest bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                                                    >
                                                        {actionLoading[company._id] ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mx-2" /> : t('verify').toUpperCase()}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmModal({ isOpen: true, companyId: company._id, isCurrentlySuspended: company.isSuspended, companyName: company.businessName })}
                                                    disabled={actionLoading[company._id]}
                                                    className={`text-[10px] px-3 py-1 font-bold uppercase tracking-widest disabled:opacity-50 shadow-sm transition-colors ${company.isSuspended
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                                        }`}
                                                >
                                                    {actionLoading[company._id] ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mx-4" /> : (company.isSuspended ? t('unsuspend').toUpperCase() : t('suspend').toUpperCase())}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6 mt-auto">
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('total')} <span className="text-[#E2B325] font-bold ml-1">{companies.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('pending')} <span className="text-[#E2B325] font-bold ml-1">{pendingCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('verified')} <span className="text-[#E2B325] font-bold ml-1">{verifiedCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('suspend')} <span className="text-[#E2B325] font-bold ml-1">{suspendedCount}</span>
                </span>
            </div>


            {/* Company Detail Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-[#1A1A1A]/80 z-50 flex items-center justify-center px-4" onClick={() => setSelectedCompany(null)}>
                    <div className="bg-white border-t-4 border-t-[#8B1A1A] max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                        <div className="bg-[#8B1A1A] px-6 py-4 flex items-start justify-between">
                            <div className="flex flex-col items-start gap-1">
                                <h3 className="font-['Playfair_Display'] text-xl font-bold text-white">
                                    {selectedCompany.businessName}
                                </h3>
                                <div><StatusBadge status={selectedCompany.verificationStatus} /></div>
                            </div>
                            <button
                                onClick={() => setSelectedCompany(null)}
                                className="text-white/60 hover:text-white text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('district')}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.district || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('town')}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.town || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('job_contact_phone')}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.contactPhone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('whatsapp', { defaultValue: 'WhatsApp' })}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.contactWhatsApp || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('suspend')}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.isSuspended ? <span className="text-[#8B1A1A] font-bold">{t('yes').toUpperCase()}</span> : t('no', { defaultValue: 'No' })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('registered')}</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{fmtDate(selectedCompany.createdAt, i18n)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            <div className="w-full">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('description')}</p>
                                <p className="text-sm text-gray-600 leading-relaxed bg-[#FAF7F2] p-3">
                                    {selectedCompany.description || t('no_desc_provided', { defaultValue: 'No description provided.' })}
                                </p>
                            </div>

                             {selectedCompany.employerUserId && (
                                <div className="mt-4 bg-[#FAF7F2] p-3 border-l-4 border-l-[#E2B325]">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('owner_account')}</p>
                                    <p className="text-sm font-semibold text-[#1A1A1A]">{selectedCompany.employerUserId.name}</p>
                                    <p className="text-xs text-gray-400">{selectedCompany.employerUserId.email}</p>
                                </div>
                            )}
                        </div>

                        {selectedCompany.isSuspended && selectedCompany.suspensionReason && (
                            <div className="mx-6 mb-4 p-4 border border-red-200 bg-red-50 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[#8B1A1A]">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-bold text-xs uppercase tracking-wider">{t('reason_suspension')}</span>
                                </div>
                                <p className="text-sm text-red-900 leading-relaxed font-medium">
                                    {selectedCompany.suspensionReason}
                                </p>
                            </div>
                        )}

                        <div className="border-t border-gray-100 px-6 py-4 bg-[#FAF7F2] flex gap-3 justify-end">
                            <button className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-4 py-2 uppercase tracking-widest hover:bg-gray-200 transition-colors font-bold" onClick={() => setSelectedCompany(null)}>{t('cancel')}</button>
                            {selectedCompany.verificationStatus === 'PENDING' && (
                                <button
                                    className="bg-green-600 text-white text-xs px-6 py-2 uppercase tracking-widest hover:bg-green-700 transition-colors font-bold shadow-sm disabled:opacity-50"
                                    disabled={actionLoading[selectedCompany._id]}
                                    onClick={() => handleVerify(selectedCompany._id)}
                                >
                                    {actionLoading[selectedCompany._id] ? t('wait') : t('verify_company_btn').toUpperCase()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.isCurrentlySuspended ? t('unsuspend_company_title') : t('suspend_company_title')}
                message={confirmModal.isCurrentlySuspended ? t('unsuspend_company_msg', { name: confirmModal.companyName }) : t('suspend_company_msg', { name: confirmModal.companyName })}
                confirmText={confirmModal.isCurrentlySuspended ? t('unsuspend').toUpperCase() : t('suspend').toUpperCase()}
                loading={confirmModal.companyId ? actionLoading[confirmModal.companyId] : false}
                requireReason={!confirmModal.isCurrentlySuspended}
                onCancel={() => setConfirmModal({ isOpen: false, companyId: null, isCurrentlySuspended: false, companyName: '' })}
                onConfirm={(reason) => handleSuspendToggle(confirmModal.companyId, confirmModal.isCurrentlySuspended, reason)}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// PAGE 4: ADMIN JOBS
// ═══════════════════════════════════════════════════════════════

export const AdminJobsPage = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await adminAPI.getJobs();
                setJobs(res?.data?.jobs || res?.jobs || []);
            } catch (err) {
                if (err.response?.status !== 404) {
                    toast.error(err.response?.data?.message || t('error_load_jobs'));
                }
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const uniqueCategories = useMemo(() => {
        const cats = new Set(jobs.map(j => j.category).filter(Boolean));
        return [...cats].sort();
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const matchSearch = !searchTerm ||
                j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.district?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
            const matchCategory = categoryFilter === 'ALL' || j.category === categoryFilter;
            return matchSearch && matchStatus && matchCategory;
        });
    }, [jobs, searchTerm, statusFilter, categoryFilter]);

    const openCount = jobs.filter(j => j.status === 'OPEN').length;
    const closedCount = jobs.filter(j => j.status === 'CLOSED').length;

    const handleDeleteJob = async (jobId) => {
        setDeleteLoading(true);
        try {
            await adminAPI.deleteJob(jobId);
            setJobs(prev => prev.filter(j => j._id !== jobId));
            setDeleteTarget(null);
            toast.success(t('job_deleted_success', { defaultValue: 'Job deleted successfully.' }));
        } catch (err) {
            toast.error(err.response?.data?.message || t('error_generic'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const getJobTypeBadge = (type) => {
        const map = {
            FULL_TIME: 'bg-[#1e40af] text-white',
            PART_TIME: 'bg-[#E2B325] text-[#8B1A1A]',
            CONTRACT: 'bg-[#6e1515] text-white',
        };
        return map[type] || 'bg-gray-200 text-gray-700';
    };

    if (loading) return <Spinner />;
    if (error) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-bold text-[#8B1A1A] uppercase tracking-wider">{t('error_load_jobs', { defaultValue: 'Failed to load jobs. Try refreshing.' })}</p>
        </div>
    );

    return (
        <div className="flex flex-col flex-1">
            <PageHeading
                title={t('job_management', { defaultValue: 'Job Management' })}
                subtitle={`${jobs.length} ${t('total_jobs')}`}
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_jobs_ph')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('filter_all')}</option>
                    <option value="OPEN">{t('active')}</option>
                    <option value="CLOSED">{t('closed')}</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">{t('all_categories')}</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    {t('showing')} {filteredJobs.length} {t('of')} {jobs.length}
                </div>
            </div>

            {/* Jobs Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title={t('all_jobs')}
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredJobs.length}
                    </span>
                }
            >
                {filteredJobs.length === 0 ? (
                    <EmptyState message={t('no_jobs_found_filters', { defaultValue: 'No jobs match your filters' })} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('job').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('employer').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('location').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('job_type_label').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('status').toUpperCase()}</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">{t('actions').toUpperCase()}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map((job, i) => (
                                    <tr key={job._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] transition-colors ${i === filteredJobs.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono border-b border-gray-100 align-middle">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#1A1A1A]">{job.title}</span>
                                                <span className="text-xs text-gray-400 mt-0.5">{job.category || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 border-b border-gray-100 align-middle">
                                            {job.employerId?.name || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 border-b border-gray-100 align-middle">
                                            {job.district}{job.town ? `, ${job.town}` : ''}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <span className={`text-xs uppercase tracking-wider px-2 py-0.5 ${getJobTypeBadge(job.jobType)}`}>
                                                {job.jobType?.replace('_', ' ') || '—'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <StatusBadge status={job.status} />
                                        </td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100 align-middle">
                                            <button
                                                onClick={() => setDeleteTarget(job)}
                                                disabled={actionLoading[job._id]}
                                                className="text-[10px] px-3 py-1 font-bold uppercase tracking-widest border border-red-500 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[job._id] ? <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" /> : t('delete').toUpperCase()}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6 mt-auto">
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('total')} <span className="text-[#E2B325] font-bold ml-1">{jobs.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('active')} <span className="text-[#E2B325] font-bold ml-1">{openCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('closed')} <span className="text-[#E2B325] font-bold ml-1">{closedCount}</span>
                </span>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title={t('delete_job', { defaultValue: 'Delete Job' })}
                message={t('delete_job_msg', { defaultValue: `Are you sure you want to delete '${deleteTarget?.title}'? This action cannot be undone.` })}
                onConfirm={() => handleDeleteJob(deleteTarget._id)}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading}
                confirmText={t('delete').toUpperCase()}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// PAGE 5: ADMIN REPORTS
// ═══════════════════════════════════════════════════════════════

export const AdminReportsPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const today = new Date().toISOString().split('T')[0];

    const fetchReport = async () => {
        // Validation
        if (new Date(startDate) > new Date(endDate)) {
            toast.error(t('error_start_end_date', { defaultValue: 'Start date cannot be after the end date.' }));
            return;
        }

        if (new Date(endDate) > new Date()) {
            toast.error(t('error_future_date', { defaultValue: 'End date cannot be in the future.' }));
            return;
        }

        setLoading(true);
        try {
            const res = await adminAPI.getReports({ startDate, endDate });
            setReport(res?.data || res);
        } catch (err) {
            toast.error(t('error_gen_report', { defaultValue: 'Failed to generate report.' }));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const exportToCSV = () => {
        if (!report) return;
        
        const { summary } = report;
        const csvRows = [
            [t('category', { defaultValue: 'Category' }), t('metric', { defaultValue: 'Metric' }), t('count', { defaultValue: 'Value' })],
            [t('nav_users'), t('total_registrations', { defaultValue: 'Total Registrations' }), summary.users.total],
            [t('nav_users'), t('job_seekers'), summary.users.seekers],
            [t('nav_users'), t('employers'), summary.users.employers],
            [t('nav_users'), t('role_labels.ADMIN'), summary.users.admins],
            [t('all_jobs'), t('total_posts', { defaultValue: 'Total Posts' }), summary.jobs.total],
            [t('all_jobs'), t('open_jobs', { defaultValue: 'Open Jobs' }), summary.jobs.open],
            [t('all_jobs'), t('closed_jobs', { defaultValue: 'Closed Jobs' }), summary.jobs.closed],
            [t('nav_applications'), t('total_submitted', { defaultValue: 'Total Submitted' }), summary.applications.total],
            [t('nav_applications'), t('status_labels.ACCEPTED'), summary.applications.accepted],
            [t('nav_applications'), t('status_labels.REJECTED'), summary.applications.rejected],
            [t('nav_applications'), t('status_labels.PENDING'), summary.applications.pending],
            [t('all_companies'), t('companies_registered'), summary.companies.total],
            [t('all_companies'), t('status_labels.VERIFIED'), summary.companies.verified],
            [t('all_companies'), t('pending_verify'), summary.companies.pending],
            [t('all_companies'), t('status_labels.SUSPENDED'), summary.companies.suspended],
        ];

        const csvContent = csvRows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `system_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col flex-1">
            <PageHeading 
                title={t('system_reports_title', { defaultValue: 'System Activity Reports' })} 
                subtitle={t('system_reports_desc', { defaultValue: 'Analyze platform growth and engagement' })} 
            />

            {/* Date Range Selector */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A] p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('start_date', { defaultValue: 'Start Date' })}</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            max={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#8B1A1A] placeholder-gray-400"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('end_date', { defaultValue: 'End Date' })}</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            max={today}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#8B1A1A] placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={fetchReport} 
                            disabled={loading}
                            className="bg-[#8B1A1A] text-white px-8 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#6e1515] transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {loading ? t('wait') : t('generate_report_btn').toUpperCase()}
                        </button>
                        {report && (
                            <button 
                                onClick={exportToCSV}
                                className="bg-[#E2B325] text-[#8B1A1A] px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-[#d1a620] transition-colors flex items-center"
                            >
                                <FileText className="inline-block mr-2" size={16} /> {t('download_csv', { defaultValue: 'DOWNLOAD CSV' })}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? <Spinner /> : report ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard label={t('new_users', { defaultValue: 'New Users' })} value={report.summary.users.total} icon={Users} accent="#8B1A1A" />
                        <StatCard label={t('recent_job_posts')} value={report.summary.jobs.total} icon={Briefcase} accent="#1e40af" />
                        <StatCard label={t('applications')} value={report.summary.applications.total} icon={FileText} accent="#E2B325" />
                        <StatCard label={t('new_companies', { defaultValue: 'New Companies' })} value={report.summary.companies.total} icon={Building2} accent="#1e40af" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Breakdown 1: Users & Companies */}
                        <SectionCard title={t('registration_breakdown', { defaultValue: 'Registration Breakdown' })}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('users_by_role', { defaultValue: 'Users by Role' })}</h4>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-[#8B1A1A]">
                                        <span className="text-sm font-semibold">{t('job_seekers')}</span>
                                        <span className="text-lg font-bold text-[#8B1A1A]">{report.summary.users.seekers}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-[#1e40af]">
                                        <span className="text-sm font-semibold">{t('employers')}</span>
                                        <span className="text-lg font-bold text-[#1e40af]">{report.summary.users.employers}</span>
                                    </div>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('company_status_label', { defaultValue: 'Company Status' })}</h4>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-green-600">
                                        <span className="text-sm font-semibold">{t('verified_companies_label', { defaultValue: 'Verified Companies' })}</span>
                                        <span className="text-lg font-bold text-green-600">{report.summary.companies.verified}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-orange-500">
                                        <span className="text-sm font-semibold">{t('pending_verify')}</span>
                                        <span className="text-lg font-bold text-orange-500">{report.summary.companies.pending}</span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Breakdown 2: Jobs & Applications */}
                        <SectionCard title={t('performance_breakdown', { defaultValue: 'Performance Breakdown' })}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('application_status', { defaultValue: 'Application Status' })}</h4>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-green-600">
                                        <span className="text-sm font-semibold">{t('apps_accepted', { defaultValue: 'Applications Accepted' })}</span>
                                        <span className="text-lg font-bold text-green-600">{report.summary.applications.accepted}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-[#8B1A1A]">
                                        <span className="text-sm font-semibold">{t('apps_rejected', { defaultValue: 'Applications Rejected' })}</span>
                                        <span className="text-lg font-bold text-[#8B1A1A]">{report.summary.applications.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-blue-500">
                                        <span className="text-sm font-semibold">{t('in_review_pending', { defaultValue: 'In Review / Pending' })}</span>
                                        <span className="text-lg font-bold text-blue-500">{report.summary.applications.pending}</span>
                                    </div>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('job_metrics', { defaultValue: 'Job Metrics' })}</h4>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-[#1e40af]">
                                        <span className="text-sm font-semibold">{t('open_positions_label', { defaultValue: 'Open Positions' })}</span>
                                        <span className="text-lg font-bold text-[#1e40af]">{report.summary.jobs.open}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#FAF7F2] p-3 border-l-4 border-l-gray-400">
                                        <span className="text-sm font-semibold">{t('closed_filled', { defaultValue: 'Closed / Filled' })}</span>
                                        <span className="text-lg font-bold text-gray-500">{report.summary.jobs.closed}</span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            ) : (
                <EmptyState message={t('select_dates_report_msg', { defaultValue: 'Select dates and generate a report' })} />
            )}
        </div>
    );
};
