import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase, AlertTriangle, CheckCircle, Trash2, Building2, Phone, MessageCircle,
    PlusCircle, ClipboardList, Archive, FileText, Clock, XCircle, Plus, ChevronRight,
    Eye, UserPlus, UserCheck, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, applicationsAPI, companiesAPI } from '../../api/services';
import { formatDate } from '../../utils/formatters';
import { DISTRICTS, CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from '../../utils/constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';


// ─── SHARED HELPERS ────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        OPEN: 'bg-[#E2B325] text-[#8B1A1A]',
        CLOSED: 'bg-gray-200 text-gray-600',
        APPLIED: 'bg-blue-600 text-white',
        REVIEWED: 'bg-[#E2B325] text-[#8B1A1A]',
        ACCEPTED: 'bg-green-700 text-white',
        REJECTED: 'bg-[#8B1A1A] text-white',
        FULL_TIME: 'bg-[#1e40af] text-white',
        PART_TIME: 'bg-[#E2B325] text-[#8B1A1A]',
        CONTRACT: 'bg-[#6e1515] text-white',
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

const EmptyState = ({ message, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-300 text-2xl">—</span>
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-2">
            {message || 'No Records Found'}
        </p>
        <p className="text-xs text-gray-300">{subtitle}</p>
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

const PageHeader = ({ rightSlot }) => (
    rightSlot ? <div className="mb-6 flex justify-end">{rightSlot}</div> : <div className="mb-6" />
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

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'DELETE' }) => {
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


// ═══════════════════════════════════════════════════════════════
// PAGE 1: EMPLOYER DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const EmployerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [myJobs, setMyJobs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                try {
                    const compRes = await companiesAPI.getMyCompany();
                    setCompany(compRes.data?.company || compRes.data || null);
                } catch { /* No company yet */ }
                try {
                    const jobsRes = await jobsAPI.getJobs({ limit: 100 });
                    const allJobs = jobsRes.data?.jobs || jobsRes.data || [];
                    const mine = allJobs.filter(j => (j.employerId?._id || j.employerId) === user?._id);
                    setMyJobs(mine);
                } catch { /* ignore */ }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const activeJobs = myJobs.filter(j => j.status === 'OPEN').length;
    const closedJobs = myJobs.filter(j => j.status === 'CLOSED').length;

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your hiring activity."
                rightSlot={
                    <button onClick={() => navigate('/employer/post-job')} className="bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420] flex items-center gap-2">
                        <Plus size={16} /> POST NEW JOB
                    </button>
                }
            />

            {/* Company Verification Banner */}
            {!company ? (
                <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-[#8B1A1A]" />
                        <span className="text-[#8B1A1A] text-sm font-semibold">Set up your company profile to start posting jobs</span>
                    </div>
                    <button onClick={() => navigate('/employer/company')} className="bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-1.5">SETUP PROFILE</button>
                </div>
            ) : company.verificationStatus === 'PENDING' ? (
                <div className="bg-orange-50 border-l-4 border-l-orange-500 px-5 py-3 mb-5 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-800 text-sm font-semibold">Company verification is pending. You can post jobs meanwhile.</span>
                </div>
            ) : company.verificationStatus === 'VERIFIED' ? (
                <div className="bg-green-50 border-l-4 border-l-green-600 px-5 py-3 mb-5 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 text-sm font-semibold">Verified Employer ✓ — Your company is verified.</span>
                </div>
            ) : company.verificationStatus === 'REJECTED' ? (
                <div className="bg-red-50 border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-[#8B1A1A]" />
                        <span className="text-[#8B1A1A] text-sm font-semibold">Verification rejected. Please update your company profile.</span>
                    </div>
                    <button onClick={() => navigate('/employer/company')} className="border border-[#8B1A1A] text-[#8B1A1A] text-xs uppercase tracking-wider px-4 py-1.5 hover:bg-[#8B1A1A] hover:text-white">UPDATE PROFILE</button>
                </div>
            ) : null}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="ACTIVE JOBS" value={activeJobs} icon={Briefcase} accentColor="#8B1A1A" />
                <StatCard label="CLOSED JOBS" value={closedJobs} icon={Archive} accentColor="#6b7280" />
                <StatCard label="TOTAL POSTED" value={myJobs.length} icon={FileText} accentColor="#E2B325" />
            </div>

            {/* My Jobs Section */}
            <SectionCard title="MY JOBS" rightSlot={<Link to="/employer/jobs" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white">View All →</Link>}>
                {myJobs.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <Briefcase className="h-12 w-12 text-gray-200" />
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">No jobs posted yet</p>
                        <button onClick={() => navigate('/employer/post-job')} className="mt-2 bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#6e1515]">Post your first job →</button>
                    </div>
                ) : (
                    myJobs.slice(0, 5).map(job => (
                        <div key={job._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                            <div className="w-1 self-stretch" style={{ backgroundColor: job.status === 'OPEN' ? '#E2B325' : '#6b7280' }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#1A1A1A]">{job.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{job.district} · {job.category}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-3">
                                <StatusBadge status={job.status} />
                                <Link to="/employer/jobs" className="text-xs uppercase tracking-wider text-[#8B1A1A] hover:text-[#E2B325]">VIEW</Link>
                            </div>
                        </div>
                    ))
                )}
            </SectionCard>

            {/* Recent Activity — 2 column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="APPLICATIONS OVERVIEW">
                    {[
                        { label: 'Pending / Applied', color: '#3b82f6' },
                        { label: 'Under Review', color: '#E2B325' },
                        { label: 'Accepted', color: '#16a34a' },
                        { label: 'Rejected', color: '#8B1A1A' },
                    ].map(item => (
                        <div key={item.label} className="flex justify-between border-b border-gray-100 py-2.5">
                            <span className="text-xs uppercase tracking-wider text-gray-500">{item.label}</span>
                            <span className="text-sm font-bold" style={{ color: item.color }}>—</span>
                        </div>
                    ))}
                    <Link to="/employer/jobs" className="text-[#8B1A1A] text-xs uppercase tracking-wider mt-3 inline-block hover:text-[#E2B325]">View All Applications</Link>
                </SectionCard>

                <SectionCard title="QUICK ACTIONS">
                    {[
                        { label: 'Post New Job', desc: 'Create a new job listing', icon: PlusCircle, path: '/employer/post-job' },
                        { label: 'My Jobs', desc: 'Manage your job postings', icon: Briefcase, path: '/employer/jobs' },
                        { label: 'Company Profile', desc: 'Update your company details', icon: Building2, path: '/employer/company' },
                        { label: 'View Applications', desc: 'Review incoming applications', icon: ClipboardList, path: '/employer/jobs' },
                    ].map(action => (
                        <div key={action.label} onClick={() => navigate(action.path)} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-[#FAF7F2] transition-colors group cursor-pointer">
                            <div className="bg-[#8B1A1A]/10 p-2.5"><action.icon className="h-5 w-5 text-[#8B1A1A]" /></div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wider group-hover:text-[#8B1A1A]">{action.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                            </div>
                            <ChevronRight className="ml-auto h-4 w-4 text-gray-300 group-hover:text-[#8B1A1A]" />
                        </div>
                    ))}
                </SectionCard>
            </div>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 2: POST JOB PAGE
// ═══════════════════════════════════════════════════════════════

const postJobSchema = yup.object({
    title: yup.string().required('Job title is required').min(5, 'Title is too short'),
    description: yup.string().required('Description is required').min(20, 'Provide more details'),
    district: yup.string().required('District is required'),
    town: yup.string().required('Town is required'),
    category: yup.string().required('Category is required'),
    jobType: yup.string().required('Job type is required'),
    contactPhone: yup.string().required('Contact phone is required'),
    salaryMin: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
    salaryMax: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
    cvRequired: yup.boolean(),
});

export const PostJobPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(postJobSchema),
        defaultValues: { jobType: 'FULL_TIME' }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: data.title,
                description: data.description,
                district: data.district,
                town: data.town,
                category: data.category,
                jobType: data.jobType,
                contactPhone: data.contactPhone,
                ...(data.salaryMin && { salaryMin: data.salaryMin }),
                ...(data.salaryMax && { salaryMax: data.salaryMax }),
                cvRequired: data.cvRequired || false,
            };
            await jobsAPI.createJob(payload);
            toast.success('Job posted successfully!');
            navigate('/employer/jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = (err) => `border border-gray-300 px-3 py-2.5 text-sm w-full focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white ${err ? 'border-red-400' : ''}`;

    const FieldWrap = ({ label, required, error, children, className = '' }) => (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {label} {required && <span className="text-[#8B1A1A]">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-[#8B1A1A] mt-0.5">{error}</p>}
        </div>
    );

    return (
        <>
            <PageHeader
                title="Post a New Job"
                subtitle="Fill in the details to attract the right candidates"
                rightSlot={<button onClick={() => navigate('/employer/jobs')} className="text-white/70 hover:text-white text-sm uppercase tracking-wider">← MY JOBS</button>}
            />

            <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A]">
                <div className="bg-[#FAF7F2] border-b border-gray-200 px-6 py-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#8B1A1A]">Job Details</h2>
                    <p className="text-xs text-gray-400 mt-0.5">All fields marked * are required</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldWrap label="Job Title" required error={errors.title?.message} className="md:col-span-2">
                        <input className={inputCls(errors.title)} placeholder="e.g. Senior Farm Supervisor" {...register('title')} />
                    </FieldWrap>

                    <FieldWrap label="District" required error={errors.district?.message}>
                        <select className={`${inputCls(errors.district)} cursor-pointer`} {...register('district')}>
                            <option value="">Select District</option>
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </FieldWrap>

                    <FieldWrap label="Town" required error={errors.town?.message}>
                        <input className={inputCls(errors.town)} placeholder="e.g. Nallur" {...register('town')} />
                    </FieldWrap>

                    <FieldWrap label="Category" required error={errors.category?.message}>
                        <select className={`${inputCls(errors.category)} cursor-pointer`} {...register('category')}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </FieldWrap>

                    <FieldWrap label="Job Type" required error={errors.jobType?.message}>
                        <select className={`${inputCls(errors.jobType)} cursor-pointer`} {...register('jobType')}>
                            <option value="">Select Type</option>
                            {JOB_TYPES.filter(t => ['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(t)).map(t => (
                                <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
                            ))}
                        </select>
                    </FieldWrap>

                    <FieldWrap label="Contact Phone" required error={errors.contactPhone?.message}>
                        <input className={inputCls(errors.contactPhone)} placeholder="e.g. 077 123 4567" {...register('contactPhone')} />
                    </FieldWrap>

                    <FieldWrap label="Minimum Salary (LKR)">
                        <input type="number" className={inputCls()} placeholder="e.g. 35000" {...register('salaryMin')} />
                    </FieldWrap>

                    <FieldWrap label="Maximum Salary (LKR)">
                        <input type="number" className={inputCls()} placeholder="e.g. 55000" {...register('salaryMax')} />
                    </FieldWrap>

                    <p className="text-xs text-gray-400 md:col-span-2 -mt-3">Leave blank if salary is negotiable</p>

                    <div className="md:col-span-2 flex items-center gap-3 bg-[#FAF7F2] p-4 border border-gray-200">
                        <input type="checkbox" id="cvRequired" {...register('cvRequired')} className="h-4 w-4 text-[#8B1A1A] focus:ring-[#8B1A1A] border-gray-300 rounded cursor-pointer" />
                        <label htmlFor="cvRequired" className="text-sm font-semibold text-[#1A1A1A] cursor-pointer inline-flex flex-col">
                            Require CV for this job
                            <span className="text-xs text-gray-500 font-normal mt-0.5">Job seekers will be forced to upload a PDF/DOC document when applying.</span>
                        </label>
                    </div>

                    <FieldWrap label="Job Description" required error={errors.description?.message} className="md:col-span-2">
                        <textarea className={`${inputCls(errors.description)} min-h-[120px] resize-y`} placeholder="Describe the role, responsibilities, and requirements..." {...register('description')} />
                    </FieldWrap>

                    <div className="md:col-span-2 border-t border-gray-200 pt-5 flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">* Required fields</span>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate('/employer/jobs')} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50">CANCEL</button>
                            <button type="submit" disabled={isSubmitting} className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50">
                                {isSubmitting ? 'POSTING...' : 'POST JOB'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 3: MY JOBS PAGE
// ═══════════════════════════════════════════════════════════════

export const MyJobsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const fetchJobs = async () => {
        try {
            const res = await jobsAPI.getJobs({ limit: 100 });
            const allJobs = res.data?.jobs || res.data || [];
            setJobs(allJobs.filter(j => (j.employerId?._id || j.employerId) === user?._id));
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [user]);

    const handleDelete = async (id) => {
        setDeleteLoading(true);
        try {
            await jobsAPI.deleteJob(id);
            setJobs(prev => prev.filter(j => j._id !== id));
            toast.success('Job deleted');
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await jobsAPI.updateJob(id, { status: newStatus });
            setJobs(prev => prev.map(j => j._id === id ? { ...j, status: newStatus } : j));
            toast.success(newStatus === 'CLOSED' ? 'Job closed' : 'Job reopened');
        } catch (error) {
            toast.error('Failed to update job');
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const filtered = jobs.filter(j => {
        const matchSearch = !searchTerm || j.title?.toLowerCase().includes(searchTerm.toLowerCase()) || j.district?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCount = jobs.filter(j => j.status === 'OPEN').length;
    const closedCount = jobs.filter(j => j.status === 'CLOSED').length;

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                title="My Jobs"
                subtitle="Manage all your job postings"
                rightSlot={
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 border border-white/20 px-4 py-2 text-white text-xs uppercase tracking-wider">
                            Active: <span className="text-[#E2B325] font-bold">{openCount}</span> | Closed: <span className="text-[#E2B325] font-bold">{closedCount}</span>
                        </div>
                        <button onClick={() => navigate('/employer/post-job')} className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#d4a420]">POST NEW JOB</button>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search by title or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer">
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider border-l border-gray-200 pl-4">
                    Showing {filtered.length} of {jobs.length}
                </div>
            </div>

            {/* Jobs Table */}
            <SectionCard className="!p-0" title="ALL JOBS" rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{filtered.length}</span>}>
                {filtered.length === 0 ? <EmptyState message="No jobs found" subtitle="Try adjusting your search or filters" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    {['#', 'JOB', 'LOCATION', 'TYPE', 'SALARY', 'STATUS', 'ACTIONS'].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap ${i < 6 ? 'border-r border-[#6e1515]' : ''} ${h === 'ACTIONS' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((job, i) => (
                                    <tr key={job._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] ${i === filtered.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-xs text-gray-400 font-mono border-b border-gray-100">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-[#1A1A1A]">{job.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{job.category}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 border-b border-gray-100">{job.district}{job.town ? `, ${job.town}` : ''}</td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={job.jobType} /></td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            {job.salaryMin || job.salaryMax ? (
                                                <span className="text-sm font-semibold text-[#8B1A1A]">Rs. {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()}</span>
                                            ) : <span className="text-xs text-gray-300">Negotiable</span>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={job.status} /></td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100">
                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                <button onClick={() => navigate(`/employer/jobs/${job._id}/applications`)} className="text-xs px-2.5 py-1 uppercase tracking-wider bg-[#8B1A1A] text-white hover:bg-[#6e1515]">APPLICATIONS</button>
                                                <button onClick={() => handleToggleStatus(job._id, job.status)} disabled={actionLoading[job._id]} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-gray-400 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                                    {actionLoading[job._id] ? '...' : job.status === 'OPEN' ? 'CLOSE' : 'REOPEN'}
                                                </button>
                                                <button onClick={() => setDeleteTarget(job)} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50">DELETE</button>
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
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6">
                <span className="text-white/70 text-xs uppercase tracking-wider">Total <span className="text-[#E2B325] font-bold ml-1">{jobs.length}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Open <span className="text-[#E2B325] font-bold ml-1">{openCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Closed <span className="text-[#E2B325] font-bold ml-1">{closedCount}</span></span>
            </div>

            <ConfirmModal isOpen={!!deleteTarget} title="Delete Job" message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                onConfirm={() => handleDelete(deleteTarget?._id)} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 4: JOB APPLICATIONS PAGE
// ═══════════════════════════════════════════════════════════════

export const JobApplicationsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    jobsAPI.getJobById(jobId),
                    applicationsAPI.getJobApplications(jobId),
                ]);
                setJob(jobRes.data?.job || jobRes.data);
                setApplications(appsRes.data?.applications || appsRes.data || []);
            } catch (error) {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        if (jobId) fetchData();
    }, [jobId]);

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await applicationsAPI.updateAppStatus(appId, { status: newStatus });
            setApplications(apps => apps.map(a => a._id === appId ? { ...a, status: newStatus } : a));
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <Spinner />;

    const totalApps = applications.length;
    const appliedCount = applications.filter(a => a.status === 'APPLIED').length;
    const reviewedCount = applications.filter(a => a.status === 'REVIEWED').length;
    const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;
    const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

    return (
        <>
            <PageHeader
                title="Applications"
                subtitle={`For: ${job?.title || 'Job'} · ${job?.district || ''}`}
                rightSlot={<button onClick={() => navigate('/employer/jobs')} className="text-white/70 hover:text-white text-sm uppercase tracking-wider cursor-pointer">← BACK TO JOBS</button>}
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="TOTAL" value={totalApps} icon={ClipboardList} accentColor="#8B1A1A" />
                <StatCard label="APPLIED" value={appliedCount} icon={UserPlus} accentColor="#3b82f6" />
                <StatCard label="REVIEWED" value={reviewedCount} icon={Eye} accentColor="#E2B325" />
                <StatCard label="ACCEPTED" value={acceptedCount} icon={UserCheck} accentColor="#16a34a" />
            </div>

            {/* Applications Table */}
            <SectionCard className="!p-0" title="ALL APPLICANTS" rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{totalApps}</span>}>
                {applications.length === 0 ? <EmptyState message="No applications yet" subtitle="Share the job listing to attract candidates" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    {['#', 'APPLICANT', 'APPLIED DATE', 'CV', 'STATUS', 'NOTE', 'ACTIONS'].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap ${i < 6 ? 'border-r border-[#6e1515]' : ''} text-left`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, i) => (
                                    <tr key={app._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] ${i === applications.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-xs text-gray-400 font-mono border-b border-gray-100">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#8B1A1A] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                                                    {getInitials(app.seekerId?.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#1A1A1A]">{app.seekerId?.name || 'Applicant'}</p>
                                                    <p className="text-xs text-gray-400">{app.seekerId?.email || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-gray-500 font-mono border-b border-gray-100">{fmtDate(app.createdAt)}</td>
                                        <td className="py-3 px-4 border-b border-gray-100 text-center">
                                            {app.cvUrl ? (
                                                <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" 
                                                   className="text-[#8B1A1A] hover:text-[#E2B325] inline-flex flex-col items-center group cursor-pointer" title="View CV">
                                                    <FileText className="h-5 w-5 mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    <span className="text-[10px] uppercase font-bold tracking-widest hidden group-hover:block">CV</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={app.status} /></td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            {app.note ? <span className="text-xs text-gray-500 italic truncate max-w-[150px] block">{app.note}</span> : <span className="text-gray-200 text-xs">—</span>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <select value={app.status} onChange={e => handleStatusChange(app._id, e.target.value)}
                                                className="border border-gray-300 text-xs px-2 py-1 focus:border-[#8B1A1A] focus:outline-none bg-white">
                                                <option value="APPLIED">Applied</option>
                                                <option value="REVIEWED">Reviewed</option>
                                                <option value="ACCEPTED">Accepted</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* Summary Footer */}
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6">
                <span className="text-white/70 text-xs uppercase tracking-wider">Total <span className="text-[#E2B325] font-bold ml-1">{totalApps}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Applied <span className="text-[#E2B325] font-bold ml-1">{appliedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Reviewed <span className="text-[#E2B325] font-bold ml-1">{reviewedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Accepted <span className="text-[#E2B325] font-bold ml-1">{acceptedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Rejected <span className="text-[#E2B325] font-bold ml-1">{rejectedCount}</span></span>
            </div>
        </>
    );
};


// ═══════════════════════════════════════════════════════════════
// PAGE 5: COMPANY PROFILE PAGE
// ═══════════════════════════════════════════════════════════════

const companySchema = yup.object({
    businessName: yup.string().required('Business name is required'),
    description: yup.string(),
    district: yup.string().required('District is required'),
    town: yup.string(),
    contactPhone: yup.string().required('Contact phone is required'),
    contactWhatsApp: yup.string(),
});

export const CompanyProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(companySchema),
    });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await companiesAPI.getMyCompany();
                const comp = res.data?.company || res.data;
                setCompany(comp);
                reset(comp);
            } catch {
                setEditing(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [reset]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (company) {
                const res = await companiesAPI.updateMyCompany(data);
                setCompany(res.data?.company || res.data);
                toast.success('Profile updated!');
                setEditing(false);
            } else {
                const res = await companiesAPI.createCompany(data);
                setCompany(res.data?.company || res.data);
                toast.success('Company profile created!');
                setEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await companiesAPI.deleteMyCompany();
            setCompany(null);
            setEditing(true);
            reset({});
            toast.success('Company profile deleted');
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) return <Spinner />;

    const inputCls = (err) => `border border-gray-300 px-3 py-2.5 text-sm w-full focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white ${err ? 'border-red-400' : ''}`;

    const FieldWrap = ({ label, required, error, children, className = '' }) => (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {label} {required && <span className="text-[#8B1A1A]">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-[#8B1A1A] mt-0.5">{error}</p>}
        </div>
    );

    // Verification banner component
    const VerificationBanner = () => {
        if (!company) return (
            <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#8B1A1A]" />
                <span className="text-[#8B1A1A] text-sm font-semibold">Create your company profile below</span>
            </div>
        );
        if (company.verificationStatus === 'PENDING') return (
            <div className="bg-orange-50 border-l-4 border-l-orange-500 px-5 py-3 mb-5 flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-orange-800 text-sm font-semibold">Company verification is pending. You can post jobs meanwhile.</span>
            </div>
        );
        if (company.verificationStatus === 'VERIFIED') return (
            <div className="bg-green-50 border-l-4 border-l-green-600 px-5 py-3 mb-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">Verified Employer ✓ — Your company is verified.</span>
            </div>
        );
        if (company.verificationStatus === 'REJECTED') return (
            <div className="bg-red-50 border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-[#8B1A1A]" />
                <span className="text-[#8B1A1A] text-sm font-semibold">Verification rejected. Please update your company profile.</span>
            </div>
        );
        return null;
    };

    // ─── CREATE / EDIT FORM MODE ───────────────────────────────
    if (editing || !company) {
        return (
            <>
                <PageHeader
                    title="Company Profile"
                    subtitle="Manage your business information"
                    rightSlot={company ? <button onClick={() => { setEditing(false); reset(company); }} className="border border-white/40 text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-white/10">CANCEL</button> : null}
                />
                <VerificationBanner />
                <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A]">
                    <div className="bg-[#FAF7F2] border-b border-gray-200 px-6 py-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#8B1A1A]">{company ? 'EDIT COMPANY PROFILE' : 'CREATE COMPANY PROFILE'}</h2>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldWrap label="Business Name" required error={errors.businessName?.message} className="md:col-span-2">
                            <input className={inputCls(errors.businessName)} placeholder="e.g. Green Valley Farms" {...register('businessName')} />
                        </FieldWrap>
                        <FieldWrap label="Description" className="md:col-span-2">
                            <textarea className={`${inputCls()} min-h-[100px] resize-y`} placeholder="Tell us about your company..." {...register('description')} />
                        </FieldWrap>
                        <FieldWrap label="District" required error={errors.district?.message}>
                            <select className={`${inputCls(errors.district)} cursor-pointer`} {...register('district')}>
                                <option value="">Select District</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </FieldWrap>
                        <FieldWrap label="Town"><input className={inputCls()} placeholder="e.g. Nallur" {...register('town')} /></FieldWrap>
                        <FieldWrap label="Contact Phone" required error={errors.contactPhone?.message}>
                            <input className={inputCls(errors.contactPhone)} placeholder="077 123 4567" {...register('contactPhone')} />
                        </FieldWrap>
                        <FieldWrap label="WhatsApp"><input className={inputCls()} placeholder="077 123 4567" {...register('contactWhatsApp')} /></FieldWrap>
                        <div className="md:col-span-2 border-t border-gray-200 pt-5 flex items-center justify-between mt-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">* Required fields</span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Looking to add your Company Logo? Upload it on your <Link to="/profile" className="text-[#8B1A1A] underline font-semibold hover:text-[#6e1515]">User Profile</Link>
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {company && <button type="button" onClick={() => { setEditing(false); reset(company); }} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50">CANCEL</button>}
                                <button type="submit" disabled={submitting} className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50">
                                    {submitting ? 'SAVING...' : company ? 'SAVE CHANGES' : 'CREATE PROFILE'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </>
        );
    }

    // ─── VIEW MODE ─────────────────────────────────────────────
    const vBadge = { PENDING: 'bg-orange-500 text-white', VERIFIED: 'bg-green-700 text-white', REJECTED: 'bg-[#8B1A1A] text-white' };

    return (
        <>
            <PageHeader
                title="Company Profile"
                subtitle="Manage your business information"
                rightSlot={<button onClick={() => setEditing(true)} className="border border-white/40 text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-white/10">EDIT PROFILE</button>}
            />
            <VerificationBanner />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left — Company Card */}
                <SectionCard title="COMPANY INFO">
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 bg-[#8B1A1A] text-white text-3xl font-bold flex items-center justify-center mt-2 rounded-full">
                            {company.businessName?.charAt(0) || 'C'}
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] text-center mt-3 font-['Playfair_Display']">{company.businessName}</h3>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mt-1 ${vBadge[company.verificationStatus] || 'bg-gray-200 text-gray-600'}`}>
                            {company.verificationStatus}
                        </span>
                        <button onClick={() => setDeleteModalOpen(true)} className="text-xs text-red-400 hover:text-red-600 uppercase tracking-wider mt-4 cursor-pointer flex items-center gap-1">
                            <Trash2 size={12} /> DELETE COMPANY
                        </button>
                    </div>
                </SectionCard>

                {/* Right — Details Card */}
                <div className="md:col-span-2">
                    <SectionCard title="BUSINESS DETAILS">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {[
                                { label: 'District', value: company.district },
                                { label: 'Town', value: company.town },
                                { label: 'Phone', value: company.contactPhone },
                                { label: 'WhatsApp', value: company.contactWhatsApp },
                            ].map(f => (
                                <div key={f.label} className="flex flex-col gap-0.5 py-3 border-b border-gray-100 px-2">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">{f.label}</span>
                                    <span className="text-sm font-medium text-[#1A1A1A]">{f.value || '—'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">ABOUT YOUR COMPANY</span>
                            <div className="text-sm text-gray-600 leading-relaxed bg-[#FAF7F2] p-4 mt-2">
                                {company.description || '—'}
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>

            <ConfirmModal isOpen={deleteModalOpen} title="Delete Company" message="Are you sure you want to delete your company profile? This action cannot be undone."
                onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} loading={deleteLoading} />
        </>
    );
};
