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
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-200 text-gray-600'}`}>
            {status}
        </span>
    );
};

const RoleBadge = ({ role }) => {
    const map = {
        ADMIN: 'bg-[#8B1A1A] text-white',
        EMPLOYER: 'bg-[#1A1A1A] text-white',
        JOB_SEEKER: 'bg-[#E2B325] text-[#8B1A1A]',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[role] || 'bg-gray-200 text-gray-600'}`}>
            {role?.replace('_', ' ')}
        </span>
    );
};

const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
        <p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-300 text-2xl">—</span>
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-2">
            {message || 'No Records Found'}
        </p>
        <p className="text-xs text-gray-300">Try adjusting your search or filters</p>
    </div>
);

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
    <div className="bg-[#8B1A1A] px-8 py-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="bg-white/10 border border-white/20 px-4 py-2">{right}</div>}
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

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'DELETE' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] p-6 max-w-sm w-full mx-4">
                <h3 className="font-['Playfair_Display'] text-lg text-[#1A1A1A] font-bold">{title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={onCancel} className="border border-gray-300 px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:bg-gray-50">
                        CANCEL
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="bg-[#8B1A1A] text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-[#6e1515] disabled:opacity-50">
                        {loading ? 'WAIT...' : confirmText}
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

    const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const statCards = [
        { label: 'Users', value: totalUsers, icon: Users, accent: '#8B1A1A' },
        { label: 'Employers', value: totalEmployers, icon: Briefcase, accent: '#1e40af' },
        { label: 'Job Seekers', value: totalSeekers, icon: UserCheck, accent: '#E2B325' },
        { label: 'Active Jobs', value: openJobs, icon: FileText, accent: '#8B1A1A' },
        { label: 'Applications', value: totalApplications, icon: ClipboardList, accent: '#E2B325' },
        { label: 'Companies', value: totalCompanies, icon: Building2, accent: '#1e40af' },
        { label: 'Pending Verify', value: pendingVerify, icon: Clock, accent: '#f97316' },
        { label: 'Suspended', value: suspendedUsers, icon: ShieldOff, accent: '#dc2626' },
    ];

    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeading title="Admin Dashboard" subtitle="Platform overview and management" right={
                <p className="text-[#E2B325] text-xs uppercase tracking-wider">{dateString}</p>
            } />

            {/* Pending Verification Alert */}
            {pendingVerify > 0 && (
                <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex md:flex-row flex-col gap-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-[#8B1A1A] h-5 w-5" />
                        <p className="text-[#8B1A1A] text-sm font-semibold">
                            {pendingVerify} company verification{pendingVerify > 1 ? 's' : ''} awaiting review
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/companies')}
                        className="bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-1.5 hover:bg-[#6e1515] sharp edges"
                    >
                        REVIEW NOW
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
                    title="Recent Registrations"
                    subtitle={
                        <Link to="/admin/users" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">
                            View All Users
                        </Link>
                    }
                >
                    {recentUsers.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4 text-center pb-0">No users yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentUsers.map(u => (
                                <div key={u._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                                    <div className="w-9 h-9 bg-[#8B1A1A] text-white flex items-center justify-center text-xs font-bold rounded-full shrink-0">
                                        {getInitials(u.name)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#1A1A1A] text-sm">{u.name}</p>
                                        <p className="text-xs text-gray-400">{u.email}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-1">
                                        <RoleBadge role={u.role} />
                                        <StatusBadge status={u.status} />
                                        <p className="text-xs text-gray-300">{fmtDate(u.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Recent Jobs */}
                <SectionCard
                    title="Recent Job Posts"
                    subtitle={<Link to="/admin/jobs" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">All Jobs</Link>}
                >
                    {recentJobs.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4 text-center pb-0">No jobs posted yet.</p>
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
                                        <p className="text-xs text-gray-300">{fmtDate(j.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Quick Actions */}
            <SectionCard title="QUICK ACTIONS">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#8B1A1A] p-4 text-center">
                        <Users className="h-8 w-8 mb-3 mx-auto text-[#8B1A1A]" />
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Manage Users</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-4">View, suspend, or activate accounts</p>
                        <button onClick={() => navigate('/admin/users')} className="w-full bg-[#8B1A1A] text-white text-xs uppercase tracking-wider py-2 hover:bg-[#6e1515]">
                            MANAGE USERS
                        </button>
                    </div>
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#E2B325] p-4 text-center">
                        <Building2 className="h-8 w-8 mb-3 mx-auto text-[#E2B325]" />
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Verify Companies</h3>
                        <p className="text-xs text-gray-400 mt-1 mb-4">Review pending company verifications</p>
                        <button onClick={() => navigate('/admin/companies')} className="w-full bg-[#8B1A1A] text-white text-xs uppercase tracking-wider py-2 hover:bg-[#6e1515]">
                            VERIFY COMPANIES
                        </button>
                    </div>
                    <div className="bg-[#FAF7F2] border border-gray-200 border-t-4 border-t-[#1e40af] p-4 text-center flex flex-col justify-between">
                        <div>
                            <BarChart2 className="h-8 w-8 mb-3 mx-auto text-[#1e40af]" />
                            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">Platform Stats</h3>
                            <p className="text-xs text-gray-400 mt-1 mb-4">Application processing summary</p>
                        </div>
                        <div className="text-left w-full mt-auto">
                            <div className="flex justify-between border-b border-gray-100 py-2 text-xs">
                                <span className="text-gray-600">Accepted Applications</span>
                                <span className="text-green-700 font-bold">{acceptedApps}</span>
                            </div>
                            <div className="flex justify-between py-2 text-xs">
                                <span className="text-gray-600">Rejected Applications</span>
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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, newStatus: null, userName: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminAPI.getUsers();
                setUsers(res?.data?.users || res?.users || []);
            } catch (err) {
                if (err.response?.status !== 404) {
                    toast.error(err.response?.data?.message || 'Failed to load users.');
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

    const handleUserStatus = async (userId, newStatus) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await adminAPI.updateUserStatus(userId, { status: newStatus });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
            toast.success(newStatus === 'SUSPENDED' ? 'User suspended.' : 'User activated.');
            setConfirmModal({ isOpen: false, userId: null, newStatus: null, userName: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status.');
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
            <p className="text-lg font-bold text-[#8B1A1A] uppercase tracking-wider">Failed to load users. Try refreshing.</p>
        </div>
    );

    return (
        <div className="flex flex-col flex-1">
            <PageHeading
                title="User Management"
                subtitle={`${users.length} total users`}
                right={
                    <p className="text-white text-xs uppercase tracking-wider">
                        Employers: <span className="text-[#E2B325] font-bold">{totalEmployers}</span>
                        &nbsp;|&nbsp;
                        Seekers: <span className="text-[#E2B325] font-bold">{totalSeekers}</span>
                        &nbsp;|&nbsp;
                        Suspended: <span className="text-[#E2B325] font-bold">{suspendedCount}</span>
                    </p>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
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
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYER">Employer</option>
                    <option value="JOB_SEEKER">Job Seeker</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    Showing {filteredUsers.length} of {users.length}
                </div>
            </div>

            {/* Users Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title="ALL USERS"
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredUsers.length}
                    </span>
                }
            >
                {filteredUsers.length === 0 ? (
                    <EmptyState message="No users match your filters" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">User</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Role</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">Joined</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, i) => (
                                    <tr key={user._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] transition-colors ${i === filteredUsers.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono border-b border-gray-100 align-middle">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#8B1A1A] text-white flex items-center justify-center text-xs font-bold rounded-full shrink-0">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-[#1A1A1A]">{user.name}</span>
                                                    <span className="text-xs text-gray-400">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle"><RoleBadge role={user.role} /></td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle"><StatusBadge status={user.status} /></td>
                                        <td className="py-3 px-4 text-gray-500 text-xs font-mono hidden md:table-cell border-b border-gray-100 align-middle">{fmtDate(user.createdAt)}</td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100 align-middle">
                                            {user.role === 'ADMIN' ? (
                                                <span className="text-gray-300 text-xs flex items-center justify-end gap-1 font-bold uppercase tracking-wider">
                                                    <Lock size={12} /> Protected
                                                </span>
                                            ) : (
                                                user.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, userId: user._id, newStatus: 'SUSPENDED', userName: user.name })}
                                                        disabled={actionLoading[user._id]}
                                                        className="px-3 py-1 text-xs uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {actionLoading[user._id] ? <div className="animate-spin h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full" /> : 'SUSPEND'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmModal({ isOpen: true, userId: user._id, newStatus: 'ACTIVE', userName: user.name })}
                                                        disabled={actionLoading[user._id]}
                                                        className="px-3 py-1 text-xs uppercase tracking-wider border border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-50"
                                                    >
                                                        {actionLoading[user._id] ? <div className="animate-spin h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full" /> : 'ACTIVATE'}
                                                    </button>
                                                )
                                            )}
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
                    Total <span className="text-[#E2B325] font-bold ml-1">{users.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Employers <span className="text-[#E2B325] font-bold ml-1">{totalEmployers}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Seekers <span className="text-[#E2B325] font-bold ml-1">{totalSeekers}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Suspended <span className="text-[#E2B325] font-bold ml-1">{suspendedCount}</span>
                </span>
            </div>

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.newStatus === 'SUSPENDED' ? 'Suspend Account' : 'Activate Account'}
                message={`Are you sure you want to ${confirmModal.newStatus === 'SUSPENDED' ? 'suspend' : 'activate'} ${confirmModal.userName}?`}
                confirmText={confirmModal.newStatus === 'SUSPENDED' ? 'SUSPEND' : 'ACTIVATE'}
                loading={confirmModal.userId ? actionLoading[confirmModal.userId] : false}
                onCancel={() => setConfirmModal({ isOpen: false, userId: null, newStatus: null, userName: '' })}
                onConfirm={() => handleUserStatus(confirmModal.userId, confirmModal.newStatus)}
            />
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 3: ADMIN COMPANIES PAGE
// ═══════════════════════════════════════════════════════════════

export const AdminCompaniesPage = () => {
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
            toast.success('Company verified.');
            if (selectedCompany?._id === id) setSelectedCompany(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify company.');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSuspendToggle = async (id, isSuspended) => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await adminAPI.suspendCompany(id);
            setCompanies(prev => prev.map(c => c._id === id ? { ...c, isSuspended: !c.isSuspended } : c));
            toast.success(isSuspended ? 'Company unsuspended.' : 'Company suspended.');
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
                title="Company Management"
                subtitle={`${companies.length} companies registered`}
                right={
                    <p className="text-white text-xs uppercase tracking-wider">
                        Pending: <span className="text-[#E2B325] font-bold">{pendingCount}</span>
                        &nbsp;|&nbsp;
                        Verified: <span className="text-[#E2B325] font-bold">{verifiedCount}</span>
                        &nbsp;|&nbsp;
                        Suspended: <span className="text-[#E2B325] font-bold">{suspendedCount}</span>
                    </p>
                }
            />

            {/* Pending Alert */}
            {pendingCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 mb-5 border-l-4 border-[#8B1A1A] bg-[#E2B325]">
                    <AlertTriangle className="text-[#8B1A1A] h-5 w-5" />
                    <span className="text-sm text-[#8B1A1A] font-semibold">
                        {pendingCount} company verification{pendingCount > 1 ? 's' : ''} awaiting review.
                    </span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or owner..."
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
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                </select>
                <select
                    value={suspendFilter}
                    onChange={e => setSuspendFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">All Suspension</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    Showing {filteredCompanies.length} of {companies.length}
                </div>
            </div>

            {/* Companies Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title="ALL COMPANIES"
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredCompanies.length}
                    </span>
                }
            >
                {filteredCompanies.length === 0 ? (
                    <EmptyState message="No companies match your filters" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Company</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">Owner</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden lg:table-cell">District</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Verification</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden sm:table-cell">Suspended</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">Actions</th>
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
                                                className="text-xs text-[#E2B325] hover:text-[#8B1A1A] underline cursor-pointer mt-0.5 uppercase tracking-wider font-bold"
                                            >
                                                Details
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
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle"><StatusBadge status={company.verificationStatus} /></td>
                                        <td className="py-3 px-4 hidden sm:table-cell border-b border-gray-100 align-middle">
                                            {company.isSuspended ? (
                                                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">YES</span>
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
                                                        className="text-xs px-2.5 py-1 uppercase tracking-wider bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                                                    >
                                                        {actionLoading[company._id] ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mx-2" /> : 'VERIFY'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmModal({ isOpen: true, companyId: company._id, isCurrentlySuspended: company.isSuspended, companyName: company.businessName })}
                                                    disabled={actionLoading[company._id]}
                                                    className={`text-xs px-2.5 py-1 uppercase tracking-wider disabled:opacity-50 ${company.isSuspended
                                                        ? 'bg-[#1e40af] text-white hover:bg-blue-800'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                                        }`}
                                                >
                                                    {actionLoading[company._id] ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mx-4" /> : (company.isSuspended ? 'UNSUSPEND' : 'SUSPEND')}
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
                    Total <span className="text-[#E2B325] font-bold ml-1">{companies.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Pending <span className="text-[#E2B325] font-bold ml-1">{pendingCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Verified <span className="text-[#E2B325] font-bold ml-1">{verifiedCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Suspended <span className="text-[#E2B325] font-bold ml-1">{suspendedCount}</span>
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
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">District</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.district || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Town</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.town || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.contactPhone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">WhatsApp</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.contactWhatsApp || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Suspended</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedCompany.isSuspended ? <span className="text-[#8B1A1A] font-bold">YES</span> : 'No'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Registered</p>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{fmtDate(selectedCompany.createdAt)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            <div className="w-full">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-sm text-gray-600 leading-relaxed bg-[#FAF7F2] p-3">
                                    {selectedCompany.description || 'No description provided.'}
                                </p>
                            </div>

                            {selectedCompany.employerUserId && (
                                <div className="mt-4 bg-[#FAF7F2] p-3 border-l-4 border-l-[#E2B325]">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Owner Account</p>
                                    <p className="text-sm font-semibold text-[#1A1A1A]">{selectedCompany.employerUserId.name}</p>
                                    <p className="text-xs text-gray-400">{selectedCompany.employerUserId.email}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4 bg-[#FAF7F2] flex gap-3 justify-end">
                            <button className="border border-gray-300 text-gray-600 text-xs px-4 py-2 uppercase tracking-wider hover:bg-gray-100" onClick={() => setSelectedCompany(null)}>CANCEL</button>
                            {selectedCompany.verificationStatus === 'PENDING' && (
                                <button
                                    className="bg-[#8B1A1A] text-white text-xs px-4 py-2 uppercase tracking-wider hover:bg-[#6e1515] disabled:opacity-50"
                                    disabled={actionLoading[selectedCompany._id]}
                                    onClick={() => handleVerify(selectedCompany._id)}
                                >
                                    {actionLoading[selectedCompany._id] ? 'VERIFYING...' : 'VERIFY THIS COMPANY'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.isCurrentlySuspended ? 'Unsuspend Company' : 'Suspend Company'}
                message={`Are you sure you want to ${confirmModal.isCurrentlySuspended ? 'unsuspend' : 'suspend'} ${confirmModal.companyName}?`}
                confirmText={confirmModal.isCurrentlySuspended ? 'UNSUSPEND' : 'SUSPEND'}
                loading={confirmModal.companyId ? actionLoading[confirmModal.companyId] : false}
                onCancel={() => setConfirmModal({ isOpen: false, companyId: null, isCurrentlySuspended: false, companyName: '' })}
                onConfirm={() => handleSuspendToggle(confirmModal.companyId, confirmModal.isCurrentlySuspended)}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// PAGE 4: ADMIN JOBS
// ═══════════════════════════════════════════════════════════════

export const AdminJobsPage = () => {
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
                    toast.error(err.response?.data?.message || 'Failed to load jobs.');
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
            toast.success('Job deleted successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete job.');
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
            <p className="text-lg font-bold text-[#8B1A1A] uppercase tracking-wider">Failed to load jobs. Try refreshing.</p>
        </div>
    );

    return (
        <div className="flex flex-col flex-1">
            <PageHeading
                title="Job Management"
                subtitle={`${jobs.length} total jobs`}
                right={
                    <div className="bg-white/10 border border-white/20 px-4 py-2">
                        <p className="text-white text-xs uppercase tracking-wider">
                            Open: <span className="text-[#E2B325] font-bold">{openCount}</span>
                            &nbsp;|&nbsp;
                            Closed: <span className="text-[#E2B325] font-bold">{closedCount}</span>
                        </p>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or district..."
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
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer"
                >
                    <option value="ALL">All Categories</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    Showing {filteredJobs.length} of {jobs.length}
                </div>
            </div>

            {/* Jobs Table */}
            <SectionCard
                className="!p-0 flex-1 flex flex-col min-h-0"
                title="ALL JOBS"
                subtitle={
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">
                        {filteredJobs.length}
                    </span>
                }
            >
                {filteredJobs.length === 0 ? (
                    <EmptyState message="No jobs match your filters" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Job</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Employer</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Location</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Type</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">Status</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">Actions</th>
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
                                                className="text-xs px-3 py-1 uppercase tracking-wider border border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading[job._id] ? <div className="animate-spin h-3 w-3 border-2 border-[#8B1A1A] border-t-transparent rounded-full" /> : 'DELETE'}
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
                    Total <span className="text-[#E2B325] font-bold ml-1">{jobs.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Open <span className="text-[#E2B325] font-bold ml-1">{openCount}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    Closed <span className="text-[#E2B325] font-bold ml-1">{closedCount}</span>
                </span>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Job"
                message={`Are you sure you want to delete '${deleteTarget?.title}'? This action cannot be undone.`}
                onConfirm={() => handleDeleteJob(deleteTarget._id)}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading}
                confirmText="DELETE"
            />
        </div>
    );
};
