import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Briefcase, CheckCircle, Clock, XCircle, ChevronRight,
    Heart, FileText, Search, Bookmark, LayoutDashboard,
    MapPin, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, jobsAPI } from '../../api/services';
import { formatDate, timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// SHARED: STATUS BADGE (maroon/gold theme)
// ═══════════════════════════════════════════════════════════════

const STATUS_BADGE = {
    APPLIED: 'bg-blue-600 text-white',
    REVIEWED: 'bg-[#E2B325] text-[#8B1A1A]',
    ACCEPTED: 'bg-green-700 text-white',
    REJECTED: 'bg-[#8B1A1A] text-white',
};

const STATUS_INDICATOR = {
    APPLIED: '#3b82f6',
    REVIEWED: '#E2B325',
    ACCEPTED: '#16a34a',
    REJECTED: '#8B1A1A',
};

const StatusBadge = ({ status }) => (
    <span className={`text-xs uppercase tracking-wider px-2.5 py-0.5 font-bold ${STATUS_BADGE[status] || 'bg-gray-200 text-gray-600'}`}>
        {status}
    </span>
);

// ═══════════════════════════════════════════════════════════════
// SHARED: SEEKER TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════

export const SeekerTabNav = () => {
    const { t } = useTranslation();
    const tabs = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/dashboard/applications', icon: FileText, label: t('my_applications') },
        { to: '/dashboard/saved', icon: Bookmark, label: t('saved_jobs') },
        { to: '/profile', icon: User, label: 'Profile' },
    ];
    return (
        <div className="bg-white border-b border-gray-200 sticky top-[64px] md:top-[72px] z-40">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-0">
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-5 py-4 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${isActive
                                    ? 'border-[#8B1A1A] text-[#8B1A1A]'
                                    : 'border-transparent text-gray-500 hover:text-[#8B1A1A] hover:border-[#8B1A1A]/30'
                                }`
                            }
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// SHARED: CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'CONFIRM' }) => {
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

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};


// ═══════════════════════════════════════════════════════════════
// PAGE 1: SEEKER DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const SeekerDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [applications, setApplications] = useState([]);
    const [allApps, setAllApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, reviewed: 0, accepted: 0, rejected: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await applicationsAPI.getMyApplications();
                const apps = res.data?.applications || res.data || [];
                setAllApps(apps);
                setApplications(apps.slice(0, 5));
                setStats({
                    total: apps.length,
                    reviewed: apps.filter(a => a.status === 'REVIEWED').length,
                    accepted: apps.filter(a => a.status === 'ACCEPTED').length,
                    rejected: apps.filter(a => a.status === 'REJECTED').length,
                });
            } catch (error) {
                console.error('Failed to fetch applications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: t('total_applications'), value: stats.total, icon: FileText, accent: '#8B1A1A' },
        { label: t('under_review'), value: stats.reviewed, icon: Clock, accent: '#E2B325' },
        { label: t('accepted'), value: stats.accepted, icon: CheckCircle, accent: '#16a34a' },
        { label: t('rejected'), value: stats.rejected, icon: XCircle, accent: '#dc2626' },
    ];

    const dateString = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <>
            {/* Welcome Banner Removed */}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map(s => (
                    <div
                        key={s.label}
                        className="bg-white border border-gray-200 p-5 flex items-start justify-between"
                        style={{ borderLeft: `4px solid ${s.accent}` }}
                    >
                        <div className="flex flex-col justify-between h-full">
                            <span className="text-3xl font-bold text-[#1A1A1A] leading-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                {s.value}
                            </span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">
                                {s.label}
                            </span>
                        </div>
                        <div className="p-3 flex items-center justify-center flex-shrink-0 ml-4" style={{ backgroundColor: s.accent + '20' }}>
                            <s.icon className="h-6 w-6" style={{ color: s.accent }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Two Column: Recent Applications + Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Applications */}
                <div className="md:col-span-2 bg-white border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white text-sm font-bold uppercase tracking-widest">
                            {t('recent_applications')}
                        </h2>
                        <NavLink to="/dashboard/applications" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">
                            {t('view_all')} →
                        </NavLink>
                    </div>
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
                                <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading')}</p>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <Briefcase className="h-12 w-12 text-gray-200" />
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('no_applications_yet')}</p>
                                <p className="text-xs text-gray-300">{t('start_browsing')}</p>
                                <NavLink to="/jobs" className="mt-2 bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#6e1515]">
                                    {t('browse_jobs')} →
                                </NavLink>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {applications.map(app => (
                                    <div key={app._id} className="flex items-center gap-3 py-3 px-5">
                                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_INDICATOR[app.status] || '#ccc' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                                                {app.jobId?.title || 'Job Title'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {app.jobId?.district || ''} · {timeAgo(app.createdAt)}
                                            </p>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-[#8B1A1A] px-5 py-3">
                        <h2 className="text-white text-sm font-bold uppercase tracking-widest">
                            {t('quick_actions')}
                        </h2>
                    </div>
                    <div className="flex-1">
                        {[
                            { to: '/jobs', icon: Search, label: t('browse_available_jobs'), desc: t('find_next_opportunity') },
                            { to: '/dashboard/applications', icon: FileText, label: t('view_my_applications'), desc: t('track_application_status') },
                            { to: '/dashboard/saved', icon: Bookmark, label: t('saved_jobs'), desc: t('jobs_you_bookmarked') },
                        ].map(action => (
                            <NavLink
                                key={action.to}
                                to={action.to}
                                className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-[#FAF7F2] transition-colors group"
                            >
                                <div className="p-2.5 bg-[#8B1A1A]/10 flex-shrink-0">
                                    <action.icon className="h-5 w-5 text-[#8B1A1A]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider group-hover:text-[#8B1A1A]">{action.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-[#8B1A1A] flex-shrink-0" />
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 2: MY APPLICATIONS
// ═══════════════════════════════════════════════════════════════

export const MyApplicationsPage = () => {
    const { t } = useTranslation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [withdrawTarget, setWithdrawTarget] = useState(null);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const fetchApps = async () => {
        try {
            const res = await applicationsAPI.getMyApplications();
            setApplications(res.data?.applications || res.data || []);
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const matchSearch = !searchTerm ||
                app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.jobId?.district?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    const handleWithdraw = async (id) => {
        setWithdrawLoading(true);
        try {
            await applicationsAPI.withdrawApplication(id);
            setApplications(prev => prev.filter(a => a._id !== id));
            setWithdrawTarget(null);
            toast.success(t('withdrawn_success'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to withdraw');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const totalApplied = applications.filter(a => a.status === 'APPLIED').length;
    const totalReviewed = applications.filter(a => a.status === 'REVIEWED').length;
    const totalAccepted = applications.filter(a => a.status === 'ACCEPTED').length;
    const totalRejected = applications.filter(a => a.status === 'REJECTED').length;

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
            <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading')}</p>
        </div>
    );

    return (
        <>
            {/* Page Header Removed */}

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
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
                    <option value="APPLIED">{t('filter_applied')}</option>
                    <option value="REVIEWED">{t('filter_reviewed')}</option>
                    <option value="ACCEPTED">{t('filter_accepted')}</option>
                    <option value="REJECTED">{t('filter_rejected')}</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider self-center border-l border-gray-200 pl-4">
                    {t('showing')} {filteredApps.length} {t('of')} {applications.length}
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest">{t('my_applications')}</h2>
                    <span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{filteredApps.length}</span>
                </div>

                {filteredApps.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <Briefcase className="h-12 w-12 text-gray-200" />
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('no_applications_msg')}</p>
                        <NavLink to="/jobs" className="mt-2 bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#6e1515]">
                            {t('browse_jobs')} →
                        </NavLink>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('job_title')}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">{t('location')}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515] hidden md:table-cell">{t('applied_date')}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap border-r border-[#6e1515]">{t('status')}</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApps.map((app, i) => (
                                    <tr key={app._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] transition-colors`}>
                                        <td className="py-3 px-4 text-gray-400 text-xs font-mono border-b border-gray-100 align-middle">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#1A1A1A]">{app.jobId?.title || 'Job'}</span>
                                                <span className="text-xs text-gray-400 mt-0.5">{app.jobId?.category || ''}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 border-b border-gray-100 align-middle hidden md:table-cell">
                                            {app.jobId?.district || '—'}{app.jobId?.town ? `, ${app.jobId.town}` : ''}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-gray-500 font-mono border-b border-gray-100 align-middle hidden md:table-cell">
                                            {fmtDate(app.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100 align-middle">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100 align-middle">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link to={`/jobs/${app.jobId?._id || app.jobId}`} className="text-xs px-3 py-1 uppercase tracking-wider border border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-colors">
                                                    {t('view_job')}
                                                </Link>
                                                {app.status === 'APPLIED' && (
                                                    <button
                                                        onClick={() => setWithdrawTarget(app)}
                                                        className="text-xs px-3 py-1 uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50 ml-1"
                                                    >
                                                        {t('withdraw')}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6">
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('total')} <span className="text-[#E2B325] font-bold ml-1">{applications.length}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('applied')} <span className="text-[#E2B325] font-bold ml-1">{totalApplied}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('reviewed')} <span className="text-[#E2B325] font-bold ml-1">{totalReviewed}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('accepted')} <span className="text-[#E2B325] font-bold ml-1">{totalAccepted}</span>
                </span>
                <span className="text-white/70 text-xs uppercase tracking-wider">
                    {t('rejected')} <span className="text-[#E2B325] font-bold ml-1">{totalRejected}</span>
                </span>
            </div>

            {/* Withdraw Modal */}
            <ConfirmModal
                isOpen={!!withdrawTarget}
                title={t('withdraw_confirm')}
                message={t('withdraw_confirm_msg')}
                onConfirm={() => handleWithdraw(withdrawTarget._id)}
                onCancel={() => setWithdrawTarget(null)}
                loading={withdrawLoading}
                confirmText={t('withdraw').toUpperCase()}
            />
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 3: SAVED JOBS
// ═══════════════════════════════════════════════════════════════

export const SavedJobsPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const savedIds = JSON.parse(localStorage.getItem('rw_saved_jobs') || '[]');
                if (savedIds.length === 0) { setLoading(false); return; }

                const results = await Promise.allSettled(
                    savedIds.map(id => jobsAPI.getJobById(id))
                );
                const jobs = results
                    .filter(r => r.status === 'fulfilled')
                    .map(r => r.value.data?.job || r.value.data || r.value);
                setSavedJobs(jobs);
            } catch (error) {
                console.error('Failed to load saved jobs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, []);

    const handleUnsave = (jobId) => {
        const savedIds = JSON.parse(localStorage.getItem('rw_saved_jobs') || '[]');
        const updated = savedIds.filter(id => id !== jobId);
        localStorage.setItem('rw_saved_jobs', JSON.stringify(updated));
        setSavedJobs(prev => prev.filter(j => j._id !== jobId));
        toast.success(t('unsave'));
    };

    return (
        <>
            {/* Page Header Removed */}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
                    <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading')}</p>
                </div>
            ) : savedJobs.length === 0 ? (
                <div className="bg-white border border-gray-200 py-16 text-center">
                    <Bookmark className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('no_saved_jobs')}</p>
                    <p className="text-xs text-gray-300 mt-1">{t('no_saved_jobs_sub')}</p>
                    <NavLink to="/jobs" className="mt-4 inline-block bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#6e1515]">
                        {t('browse_jobs')} →
                    </NavLink>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedJobs.map(job => (
                        <div key={job._id} className="bg-white border border-gray-200 border-l-4 border-l-[#8B1A1A] p-5 flex flex-col gap-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-bold text-[#1A1A1A] leading-tight">{job.title}</h3>
                                <StatusBadge status={job.status} />
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {job.district}{job.town ? `, ${job.town}` : ''}
                                </span>
                                {job.category && (
                                    <span className="bg-[#FAF7F2] text-xs px-2 py-0.5 text-gray-500">{job.category}</span>
                                )}
                            </div>

                            {/* Salary */}
                            {(job.salaryMin || job.salaryMax) && (
                                <p className="text-sm font-semibold text-[#8B1A1A]">
                                    Rs. {job.salaryMin?.toLocaleString() || '—'} – {job.salaryMax?.toLocaleString() || '—'}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="border-t border-gray-100 pt-3 mt-auto flex gap-2">
                                <Link to={`/jobs/${job._id}`} className="flex-1 text-center bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-3 py-1.5 hover:bg-[#6e1515] transition-colors">
                                    {t('apply_now')}
                                </Link>
                                <button
                                    onClick={() => handleUnsave(job._id)}
                                    className="border border-gray-300 text-gray-400 text-xs uppercase tracking-wider px-3 py-1.5 hover:border-red-400 hover:text-red-400 transition-colors"
                                >
                                    {t('unsave')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
