import { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Briefcase, CheckCircle, Clock, XCircle, ChevronRight,
    Heart, FileText, Search, Bookmark, AlertTriangle, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, jobsAPI } from '../../api/services';
import { timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS (Match Employer Dashboard)
// ═══════════════════════════════════════════════════════════════

const StatusBadge = ({ status }) => {
    const map = {
        OPEN: 'bg-[#E2B325] text-[#8B1A1A]',
        CLOSED: 'bg-gray-200 text-gray-600',
        APPLIED: 'bg-blue-600 text-white',
        REVIEWED: 'bg-[#E2B325] text-[#8B1A1A]',
        ACCEPTED: 'bg-green-700 text-white',
        REJECTED: 'bg-[#8B1A1A] text-white',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-200 text-gray-600'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
};

const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
        <p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p>
    </div>
);

const EmptyState = ({ message, subtitle, icon: Icon = Briefcase }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="p-4 bg-gray-50 border border-gray-100 mb-2">
            <Icon className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{message || 'No Records Found'}</p>
        <p className="text-xs text-gray-300 max-w-xs">{subtitle}</p>
    </div>
);

const SectionCard = ({ children, className = '', title, rightSlot }) => (
    <div className={`bg-white border border-gray-200 overflow-hidden mb-6 ${className}`}>
        {title && (
            <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                <h2 className="text-white text-sm font-bold uppercase tracking-widest">{title}</h2>
                {rightSlot && <span>{rightSlot}</span>}
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

const PageHeader = ({ title, subtitle, rightSlot }) => (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            {/* Minimal header */}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
    </div>
);

const StatCard = ({ label, value, icon: Icon, accentColor }) => (
    <div className="bg-white border border-gray-200 p-5 flex items-start justify-between" style={{ borderLeft: `4px solid ${accentColor}` }}>
        <div className="flex flex-col">
            <span className="text-3xl font-bold text-[#1A1A1A] leading-none" style={{ fontFamily: 'DM Sans, sans-serif' }}>{value}</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">{label}</span>
        </div>
        <div className="p-3 flex-shrink-0 ml-4" style={{ backgroundColor: accentColor + '18' }}>
            <Icon className="h-6 w-6" style={{ color: accentColor }} />
        </div>
    </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'CONFIRM' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] p-6 max-w-sm w-full mx-4">
                <h3 className="font-['Playfair_Display'] text-lg text-[#1A1A1A] font-bold">{title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={onCancel} className="border border-gray-300 px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:bg-gray-50">CANCEL</button>
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
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, reviewed: 0, accepted: 0, rejected: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await applicationsAPI.getMyApplications();
                const apps = res.data?.applications || res.data || [];
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

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                rightSlot={
                    <button onClick={() => navigate('/jobs')} className="bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420] flex items-center gap-2">
                        <Search size={16} /> BROWSE JOBS
                    </button>
                }
            />

            {/* Profile Banner */}
            {!user?.phone && (
                <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-[#8B1A1A]" />
                        <span className="text-[#8B1A1A] text-sm font-semibold">Complete your profile to increase your chances of getting hired</span>
                    </div>
                    <button onClick={() => navigate('/profile')} className="bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-1.5 hover:bg-[#6e1515]">UPDATE PROFILE</button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="APPLICATIONS" value={stats.total} icon={FileText} accentColor="#8B1A1A" />
                <StatCard label="REVIEWED" value={stats.reviewed} icon={Clock} accentColor="#E2B325" />
                <StatCard label="ACCEPTED" value={stats.accepted} icon={CheckCircle} accentColor="#16a34a" />
                <StatCard label="REJECTED" value={stats.rejected} icon={XCircle} accentColor="#dc2626" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Recent Applications */}
                <SectionCard className="md:col-span-2 !p-0 border-none" title="RECENT APPLICATIONS" rightSlot={<NavLink to="/dashboard/applications" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white">View All →</NavLink>}>
                    {applications.length === 0 ? (
                        <EmptyState message="No applications yet" subtitle="Start applying to jobs to track them here" icon={Briefcase} />
                    ) : (
                        <div className="divide-y divide-gray-100 bg-white border border-t-0 border-gray-200">
                            {applications.map((app, i) => (
                                <div key={app._id} className="flex items-center gap-3 py-3 px-5 hover:bg-[#FAF7F2] transition-colors">
                                    <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: app.status === 'APPLIED' ? '#3b82f6' : app.status === 'REVIEWED' ? '#E2B325' : app.status === 'ACCEPTED' ? '#16a34a' : '#8B1A1A' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">{app.jobId?.title || 'Job Title'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{app.jobId?.district || ''} · {timeAgo(app.createdAt)}</p>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Quick Actions */}
                <SectionCard className="!p-0 border-none" title="QUICK ACTIONS">
                    <div className="bg-white border border-t-0 border-gray-200 divide-y divide-gray-100">
                        {[
                            { to: '/jobs', icon: Search, label: 'Browse Jobs', desc: 'Find your next opportunity' },
                            { to: '/dashboard/applications', icon: FileText, label: 'My Applications', desc: 'Track your application statuses' },
                            { to: '/dashboard/saved', icon: Bookmark, label: 'Saved Jobs', desc: 'View jobs you bookmarked' },
                            { to: '/profile', icon: User, label: 'My Profile', desc: 'Update your personal details' },
                        ].map(action => (
                            <NavLink key={action.to} to={action.to} className="flex items-center gap-4 p-4 hover:bg-[#FAF7F2] transition-colors group">
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
                </SectionCard>
            </div>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 2: MY APPLICATIONS
// ═══════════════════════════════════════════════════════════════

export const MyApplicationsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
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

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                rightSlot={
                    <button onClick={() => navigate('/jobs')} className="bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420] flex items-center gap-2">
                        <Search size={16} /> BROWSE JOBS
                    </button>
                }
            />

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
            <SectionCard className="!p-0 border-none" title="MY APPLICATIONS" rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{filteredApps.length}</span>}>
                <div className="bg-white border border-t-0 border-gray-200">
                    {filteredApps.length === 0 ? (
                        <EmptyState message={t('no_applications_msg')} subtitle="Try searching for jobs that match your skillset" icon={Briefcase} />
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
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    <button onClick={() => navigate(`/jobs/${app.jobId?._id || app.jobId}`)} className="text-xs px-2.5 py-1 uppercase tracking-wider bg-[#8B1A1A] text-white hover:bg-[#6e1515]">
                                                        {t('view_job')}
                                                    </button>
                                                    {app.status === 'APPLIED' && (
                                                        <button
                                                            onClick={() => setWithdrawTarget(app)}
                                                            className="text-xs px-2.5 py-1 uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50"
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
            </SectionCard>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex flex-wrap gap-4 md:gap-6">
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
    const navigate = useNavigate();
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

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                rightSlot={
                    <button onClick={() => navigate('/jobs')} className="bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420] flex items-center gap-2">
                        <Search size={16} /> BROWSE JOBS
                    </button>
                }
            />

            <SectionCard className="!p-0 border-none" title="SAVED JOBS" rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{savedJobs.length}</span>}>
                <div className="bg-[#FAF7F2] p-6 border-x border-b border-gray-200">
                    {savedJobs.length === 0 ? (
                        <EmptyState message={t('no_saved_jobs')} subtitle={t('no_saved_jobs_sub')} icon={Bookmark} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {savedJobs.map(job => (
                                <div key={job._id} className="bg-white border border-gray-200 border-l-4 border-l-[#8B1A1A] hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-base font-bold text-[#8B1A1A] leading-tight line-clamp-2">{job.title}</h3>
                                        <StatusBadge status={job.status} />
                                    </div>

                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <span className="flex items-center gap-2 text-[13px] text-gray-700 font-medium">
                                            <Briefcase className="h-3.5 w-3.5 text-[#DAB82D]" />
                                            {job.employerId?.name || job.employerId?.businessName || 'Confidential'}
                                        </span>
                                        <span className="flex items-center gap-2 text-[13px] text-gray-600">
                                            <Search className="h-3.5 w-3.5 text-[#8B1A1A]" />
                                            {job.district}{job.town ? `, ${job.town}` : ''}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3 mt-auto flex gap-2">
                                        <button onClick={() => navigate(`/jobs/${job._id}`)} className="flex-1 text-center bg-[#8B1A1A] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-2 hover:bg-[#6e1515] transition-colors">
                                            {t('apply_now')}
                                        </button>
                                        <button
                                            onClick={() => handleUnsave(job._id)}
                                            className="border border-gray-300 text-gray-400 text-[11px] font-bold uppercase tracking-wider px-3 py-2 hover:border-red-400 hover:text-red-400 transition-colors"
                                        >
                                            {t('unsave')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SectionCard>
        </>
    );
};
