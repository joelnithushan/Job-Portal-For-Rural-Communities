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
import { useTranslation } from 'react-i18next';



const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
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
            {t(`status_labels.${status}`, { defaultValue: status?.replace('_', ' ') })}
        </span>
    );
};

const Spinner = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
            <p className="text-sm text-gray-400 uppercase tracking-widest">{t('loading')}</p>
        </div>
    );
};

const EmptyState = ({ message, subtitle }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-300 text-2xl">—</span>
            </div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-2">
                {message || t('no_records_found')}
            </p>
            <p className="text-xs text-gray-300">{subtitle}</p>
        </div>
    );
};

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

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] p-6 max-w-sm w-full mx-4">
                <h3 className="font-['Playfair_Display'] text-lg text-[#1A1A1A] font-bold">{title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={onCancel} className="border border-gray-300 px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                    <button onClick={onConfirm} disabled={loading} className="bg-[#8B1A1A] text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-[#6e1515] disabled:opacity-50">
                        {loading ? t('wait') : (confirmText || t('confirm'))}
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

const fmtDate = (d, i18n) => {
    return formatDate(d, i18n);
};

const ApplicantProfileModal = ({ isOpen, applicant, onClose }) => {
    const { t } = useTranslation();
    if (!isOpen || !applicant) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#8B1A1A] bg-white">
                    <XCircle className="h-6 w-6" />
                </button>
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        {applicant.profilePicture && !applicant.profilePicture.includes('default_avatar') ? (
                            <img src={applicant.profilePicture} alt={applicant.name} className="h-16 w-16 object-cover border-2 border-[#E2B325] shadow-sm shrink-0" />
                        ) : (
                            <div className="h-16 w-16 bg-[#8B1A1A] text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-inner">
                                {getInitials(applicant.name)}
                            </div>
                        )}
                        <div>
                            <h3 className="font-['Playfair_Display'] text-2xl text-[#1A1A1A] font-bold">{applicant.name || t('applicant')}</h3>
                            <span className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 inline-block">
                                {t('role_labels.JOB_SEEKER')}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('auth_email_address')}</p>
                                <p className="text-sm font-medium text-[#1A1A1A] truncate" title={applicant.email}>{applicant.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('job_contact_phone')}</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.phone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">NIC</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.nic || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.gender ? applicant.gender.charAt(0) + applicant.gender.slice(1).toLowerCase() : '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.dob ? fmtDate(applicant.dob, i18n) : '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Age</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.dob ? `${Math.abs(new Date(Date.now() - new Date(applicant.dob).getTime()).getUTCFullYear() - 1970)} years` : '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('district')}</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.district || '—'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                <p className="text-sm font-medium text-[#1A1A1A]">{applicant.address || '—'}</p>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{t('bio_label', { defaultValue: 'Bio / About Me' })}</p>
                            <div className="bg-[#FAF7F2] p-4 text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
                                {applicant.bio || <span className="italic text-gray-400">{t('no_bio', { defaultValue: 'No bio provided.' })}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export const EmployerDashboard = () => {
    const { t } = useTranslation();
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
                    const jobsRes = await jobsAPI.getMyJobs();
                    setMyJobs(jobsRes.data?.jobs || jobsRes.data || []);
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
                rightSlot={
                    <button onClick={() => navigate('/employer/post-job')} className="bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420] flex items-center gap-2">
                        <Plus size={16} /> {t('post_new_job')}
                    </button>
                }
            />

            {/* Company Verification Banner */}
            {!company ? (
                <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-[#8B1A1A]" />
                        <span className="text-[#8B1A1A] text-sm font-semibold">{t('setup_company_profile')}</span>
                    </div>
                    <button onClick={() => navigate('/employer/company')} className="bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-1.5">{t('setup_profile_btn')}</button>
                </div>
            ) : company.verificationStatus === 'PENDING' ? (
                <div className="bg-orange-50 border-l-4 border-l-orange-500 px-5 py-3 mb-5 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-800 text-sm font-semibold">{t('company_pending')}</span>
                </div>
            ) : company.verificationStatus === 'VERIFIED' ? (
                <div className="bg-green-50 border-l-4 border-l-green-600 px-5 py-3 mb-5 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 text-sm font-semibold">{t('company_verified')}</span>
                </div>
            ) : company.verificationStatus === 'REJECTED' ? (
                <div className="bg-red-50 border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-[#8B1A1A]" />
                        <span className="text-[#8B1A1A] text-sm font-semibold">{t('company_rejected')}</span>
                    </div>
                    <button onClick={() => navigate('/employer/company')} className="border border-[#8B1A1A] text-[#8B1A1A] text-xs uppercase tracking-wider px-4 py-1.5 hover:bg-[#8B1A1A] hover:text-white">{t('update_profile_btn')}</button>
                </div>
            ) : null}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label={t('active_jobs')} value={activeJobs} icon={Briefcase} accentColor="#8B1A1A" />
                <StatCard label={t('closed_jobs')} value={closedJobs} icon={Archive} accentColor="#6b7280" />
                <StatCard label={t('total_posted')} value={myJobs.length} icon={FileText} accentColor="#E2B325" />
            </div>

            {/* My Jobs Section */}
            <SectionCard title={t('my_jobs')} rightSlot={<Link to="/employer/jobs" className="text-[#E2B325] text-xs font-bold uppercase tracking-wider hover:text-white">{t('view_all')} →</Link>}>
                {myJobs.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <Briefcase className="h-12 w-12 text-gray-200" />
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('no_jobs_posted', { defaultValue: 'No jobs posted yet' })}</p>
                        <button onClick={() => navigate('/employer/post-job')} className="mt-2 bg-[#8B1A1A] text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#6e1515]">{t('post_first_job', { defaultValue: 'Post your first job →' })}</button>
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
                                <Link to="/employer/jobs" className="text-xs uppercase tracking-wider text-[#8B1A1A] hover:text-[#E2B325]">{t('view_label', { defaultValue: 'VIEW' })}</Link>
                            </div>
                        </div>
                    ))
                )}
            </SectionCard>

            {/* Recent Activity — 2 column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title={t('applications_overview')}>
                    {[
                        { label: t('pending_applied'), color: '#3b82f6' },
                        { label: t('under_review'), color: '#E2B325' },
                        { label: t('accepted'), color: '#16a34a' },
                        { label: t('rejected'), color: '#8B1A1A' },
                    ].map(item => (
                        <div key={item.label} className="flex justify-between border-b border-gray-100 py-2.5">
                            <span className="text-xs uppercase tracking-wider text-gray-500">{item.label}</span>
                            <span className="text-sm font-bold" style={{ color: item.color }}>—</span>
                        </div>
                    ))}
                    <Link to="/employer/jobs" className="text-[#8B1A1A] text-xs uppercase tracking-wider mt-3 inline-block hover:text-[#E2B325]">{t('all_job_applications')}</Link>
                </SectionCard>

                <SectionCard title={t('quick_actions')}>
                    {[
                        { label: t('post_new_job'), desc: t('create_job_desc', { defaultValue: 'Create a new job listing' }), icon: PlusCircle, path: '/employer/post-job' },
                        { label: t('my_jobs'), desc: t('manage_jobs_desc', { defaultValue: 'Manage your job postings' }), icon: Briefcase, path: '/employer/jobs' },
                        { label: t('company'), desc: t('update_company_desc', { defaultValue: 'Update your company details' }), icon: Building2, path: '/employer/company' },
                        { label: t('all_job_applications'), desc: t('review_apps_desc', { defaultValue: 'Review incoming applications' }), icon: ClipboardList, path: '/employer/jobs' },
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


const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;

export const PostJobPage = () => {
    const { t } = useTranslation();
    
    const postJobSchema = yup.object({
        title: yup.string().required(t('err_title_req', { defaultValue: 'Job title is required' })).min(5, t('err_title_short', { defaultValue: 'Title is too short' })),
        description: yup.string().required(t('err_desc_req', { defaultValue: 'Description is required' })).min(20, t('err_desc_short', { defaultValue: 'Provide more details' })),
        district: yup.string().required(t('err_district_req', { defaultValue: 'District is required' })),
        town: yup.string().required(t('err_town_req', { defaultValue: 'Town is required' })),
        category: yup.string().required(t('err_cat_req', { defaultValue: 'Category is required' })),
        jobType: yup.string().required(t('err_type_req', { defaultValue: 'Job type is required' })),
        contactPhone: yup.string().required(t('err_phone_req', { defaultValue: 'Contact phone is required' })).matches(phoneRegex, t('err_phone_invalid', { defaultValue: 'Must be a valid Sri Lankan mobile number' })),
        salaryMin: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
        salaryMax: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
        ageLimitMin: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
        ageLimitMax: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
        genderRequirement: yup.string().oneOf(['ANY', 'MALE', 'FEMALE']).default('ANY'),
        cvRequired: yup.boolean(),
    });

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
                ...(data.ageLimitMin && { ageLimitMin: data.ageLimitMin }),
                ...(data.ageLimitMax && { ageLimitMax: data.ageLimitMax }),
                ...(data.genderRequirement && { genderRequirement: data.genderRequirement }),
                cvRequired: data.cvRequired || false,
            };
            await jobsAPI.createJob(payload);
            toast.success(t('job_posted_success', { defaultValue: 'Job posted successfully!' }));
            navigate('/employer/jobs');
        } catch (error) {
            const msg = error.response?.data?.message || t('error_generic');
            if (msg.includes('INCOMPLETE_COMPANY')) {
                toast.error(t('setup_profile_error', { defaultValue: 'Please set up your company profile before posting a job' }));
                navigate('/employer/company');
                return;
            }
            toast.error(msg);
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
                rightSlot={<button onClick={() => navigate('/employer/jobs')} className="text-[#8B1A1A] hover:bg-[#FAF7F2] border border-[#8B1A1A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">← MY JOBS</button>}
            />

            <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A]">
                <div className="bg-[#FAF7F2] border-b border-gray-200 px-6 py-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#8B1A1A]">{t('job_details')}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{t('fields_required', { defaultValue: 'All fields marked * are required' })}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldWrap label={t('job_title_label')} required error={errors.title?.message} className="md:col-span-2">
                        <input className={inputCls(errors.title)} placeholder={t('job_title_ph', { defaultValue: 'e.g. Senior Farm Supervisor' })} {...register('title')} />
                    </FieldWrap>

                    <FieldWrap label={t('district')} required error={errors.district?.message}>
                        <select className={`${inputCls(errors.district)} cursor-pointer`} {...register('district')}>
                            <option value="">{t('select_district', { defaultValue: 'Select District' })}</option>
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </FieldWrap>

                    <FieldWrap label={t('town')} required error={errors.town?.message}>
                        <input className={inputCls(errors.town)} placeholder={t('town_ph', { defaultValue: 'e.g. Nallur' })} {...register('town')} />
                    </FieldWrap>

                    <FieldWrap label={t('category')} required error={errors.category?.message}>
                        <select className={`${inputCls(errors.category)} cursor-pointer`} {...register('category')}>
                            <option value="">{t('select_category', { defaultValue: 'Select Category' })}</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </FieldWrap>

                    <FieldWrap label={t('job_type_label')} required error={errors.jobType?.message}>
                        <select className={`${inputCls(errors.jobType)} cursor-pointer`} {...register('jobType')}>
                            <option value="">{t('select_type', { defaultValue: 'Select Type' })}</option>
                            {JOB_TYPES.filter(t => ['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(t)).map(type => (
                                <option key={type} value={type}>{JOB_TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </FieldWrap>

                    <FieldWrap label={t('job_contact_phone')} required error={errors.contactPhone?.message}>
                        <input className={inputCls(errors.contactPhone)} placeholder={t('phone_ph', { defaultValue: 'e.g. 077 123 4567' })} {...register('contactPhone')} />
                    </FieldWrap>

                    <FieldWrap label={t('salary_min', { defaultValue: 'Minimum Salary (LKR)' })}>
                        <input type="number" className={inputCls()} placeholder="e.g. 25000" {...register('salaryMin')} />
                    </FieldWrap>
                    <FieldWrap label={t('salary_max', { defaultValue: 'Maximum Salary (LKR)' })}>
                        <input type="number" className={inputCls()} placeholder="e.g. 75000" {...register('salaryMax')} />
                    </FieldWrap>
                    <p className="text-xs text-gray-400 md:col-span-2 -mt-3">{t('salary_neg_hint', { defaultValue: 'Leave blank if salary is negotiable' })}</p>

                    <FieldWrap label="Minimum Age Limit">
                        <input type="number" className={inputCls(errors.ageLimitMin)} placeholder="e.g. 18" {...register('ageLimitMin')} />
                    </FieldWrap>
                    <FieldWrap label="Maximum Age Limit">
                        <input type="number" className={inputCls(errors.ageLimitMax)} placeholder="e.g. 35" {...register('ageLimitMax')} />
                    </FieldWrap>
                    
                    <FieldWrap label="Gender Requirement" error={errors.genderRequirement?.message}>
                        <select className={`${inputCls(errors.genderRequirement)} cursor-pointer`} {...register('genderRequirement')}>
                            <option value="ANY">Any Gender</option>
                            <option value="MALE">Male Only</option>
                            <option value="FEMALE">Female Only</option>
                        </select>
                    </FieldWrap>

                    <div className="md:col-span-2 flex items-center gap-3 bg-[#FAF7F2] p-4 border border-gray-200">
                        <input type="checkbox" id="cvRequired" {...register('cvRequired')} className="h-4 w-4 text-[#8B1A1A] focus:ring-[#8B1A1A] border-gray-300 rounded-none cursor-pointer" />
                        <label htmlFor="cvRequired" className="text-sm font-semibold text-[#1A1A1A] cursor-pointer inline-flex flex-col">
                            {t('cv_required')}
                            <span className="text-xs text-gray-500 font-normal mt-0.5">{t('cv_hint', { defaultValue: 'Job seekers will be forced to upload a PDF/DOC document when applying.' })}</span>
                        </label>
                    </div>

                    <FieldWrap label={t('job_desc_title')} required error={errors.description?.message} className="md:col-span-2">
                        <textarea className={`${inputCls(errors.description)} min-h-[120px] resize-y`} placeholder={t('job_desc_ph')} {...register('description')} />
                    </FieldWrap>

                    <div className="md:col-span-2 border-t border-gray-200 pt-5 flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">* {t('fields_required_label', { defaultValue: 'Required fields' })}</span>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate('/employer/jobs')} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50">{t('cancel')}</button>
                            <button type="submit" disabled={isSubmitting} className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50">
                                {isSubmitting ? t('posting_btn') : t('post_job_btn')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};



export const MyJobsPage = () => {
    const { t } = useTranslation();
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
            const res = await jobsAPI.getMyJobs();
            setJobs(res.data?.jobs || res.data || []);
        } catch (error) {
            toast.error(t('error_load_jobs', { defaultValue: 'Failed to load jobs' }));
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
            toast.success(t('job_deleted_success', { defaultValue: 'Job deleted' }));
            setDeleteTarget(null);
        } catch (error) {
            console.error('Job deletion error:', error);
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
            toast.success(newStatus === 'CLOSED' ? t('job_closed_success', { defaultValue: 'Job closed' }) : t('job_reopened_success', { defaultValue: 'Job reopened' }));
        } catch (error) {
            toast.error(t('error_generic'));
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
                rightSlot={
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 border border-white/20 px-4 py-2 text-white text-xs uppercase tracking-wider">
                            {t('active')}: <span className="text-[#E2B325] font-bold">{openCount}</span> | {t('closed')}: <span className="text-[#E2B325] font-bold">{closedCount}</span>
                        </div>
                        <button onClick={() => navigate('/employer/post-job')} className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#d4a420]">{t('post_new_job')}</button>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder={t('search_jobs_ph', { defaultValue: 'Search by title or location...' })} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer">
                    <option value="ALL">{t('filter_all')}</option>
                    <option value="OPEN">{t('active')}</option>
                    <option value="CLOSED">{t('closed')}</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider border-l border-gray-200 pl-4">
                    {t('showing')} {filtered.length} {t('of')} {jobs.length}
                </div>
            </div>

            {/* Jobs Table */}
            <SectionCard className="!p-0" title={t('all_jobs')} rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{filtered.length}</span>}>
                {filtered.length === 0 ? <EmptyState message={t('jobs_empty_title')} subtitle={t('jobs_empty_desc')} /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    {['#', t('job').toUpperCase(), t('location').toUpperCase(), t('job_type_label').toUpperCase(), t('salary').toUpperCase(), t('status').toUpperCase(), t('actions').toUpperCase()].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap ${i < 6 ? 'border-r border-[#6e1515]' : ''} ${h === t('actions').toUpperCase() ? 'text-right' : 'text-left'}`}>{h}</th>
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
                                            ) : <span className="text-xs text-gray-300">{t('negotiable', { defaultValue: 'Negotiable' })}</span>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={job.status} /></td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100">
                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                <button onClick={() => navigate(`/employer/jobs/${job._id}/applications`)} className="text-xs px-2.5 py-1 uppercase tracking-wider bg-[#8B1A1A] text-white hover:bg-[#6e1515]">{t('applications').toUpperCase()}</button>
                                                <button onClick={() => handleToggleStatus(job._id, job.status)} disabled={actionLoading[job._id]} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-gray-400 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                                    {actionLoading[job._id] ? '...' : job.status === 'OPEN' ? t('close').toUpperCase() : t('reopen', { defaultValue: 'REOPEN' })}
                                                </button>
                                                <button onClick={() => setDeleteTarget(job)} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50">{t('delete').toUpperCase()}</button>
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
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('total')} <span className="text-[#E2B325] font-bold ml-1">{jobs.length}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('active')} <span className="text-[#E2B325] font-bold ml-1">{openCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('closed')} <span className="text-[#E2B325] font-bold ml-1">{closedCount}</span></span>
            </div>

            <ConfirmModal isOpen={!!deleteTarget} title={t('delete_job', { defaultValue: 'Delete Job' })} message={t('delete_job_msg', { defaultValue: `Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.` })}
                onConfirm={() => handleDelete(deleteTarget?._id)} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        </>
    );
};



export const JobApplicationsPage = () => {
    const { t, i18n } = useTranslation();
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewApplicant, setViewApplicant] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (jobId && jobId !== 'jobId') {
                    const [jobRes, appsRes] = await Promise.all([
                        jobsAPI.getJobById(jobId),
                        applicationsAPI.getJobApplications(jobId),
                    ]);
                    setJob(jobRes.data?.job || jobRes.data);
                    setApplications(appsRes.data?.applications || appsRes.data || []);
                } else {
                    const appsRes = await applicationsAPI.getEmployerApplications();
                    setApplications(appsRes.data?.applications || appsRes.data || []);
                    setJob(null);
                }
            } catch (error) {
                toast.error(t('error_load_apps', { defaultValue: 'Failed to load applications' }));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);

    const handleStatusChange = async (appId, newStatus) => {
        try {
            await applicationsAPI.updateAppStatus(appId, { status: newStatus });
            setApplications(apps => apps.map(a => a._id === appId ? { ...a, status: newStatus } : a));
            toast.success(t('status_updated_success', { defaultValue: 'Status updated' }));
        } catch (error) {
            toast.error(t('error_status_update', { defaultValue: 'Failed to update status' }));
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
                rightSlot={jobId && jobId !== 'jobId' ? (
                    <button onClick={() => navigate('/employer/jobs')} className="text-[#8B1A1A] hover:bg-[#FAF7F2] border border-[#8B1A1A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">← BACK TO JOBS</button>
                ) : null}
            />

            <div className="mb-6">
                <h1 className="text-2xl font-heading text-[#1A1A1A] font-bold uppercase tracking-tight">
                    {job ? `${t('applications_for')}: ${job.title}` : t('all_job_applications')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {job ? t('review_job_apps_desc', { defaultValue: 'Review candidates who applied for this specific position' }) : t('review_all_apps_desc', { defaultValue: 'Review all candidates across all your active job postings' })}
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label={t('total')} value={totalApps} icon={ClipboardList} accentColor="#8B1A1A" />
                <StatCard label={t('status_labels.APPLIED')} value={appliedCount} icon={UserPlus} accentColor="#3b82f6" />
                <StatCard label={t('status_labels.REVIEWED')} value={reviewedCount} icon={Eye} accentColor="#E2B325" />
                <StatCard label={t('status_labels.ACCEPTED')} value={acceptedCount} icon={UserCheck} accentColor="#16a34a" />
            </div>

            {/* Applications Table */}
            <SectionCard className="!p-0" title={job ? t('applicants_for_job', { defaultValue: "APPLICANTS FOR THIS JOB" }) : t('all_applicants', { defaultValue: "ALL APPLICANTS" })} rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{totalApps}</span>}>
                {applications.length === 0 ? <EmptyState message={t('no_applications_yet')} subtitle={t('attract_candidates_desc', { defaultValue: "Share the job listing to attract candidates" })} /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    {['#', t('applicant'), !job ? t('job_title_label') : null, t('applied_date'), t('cv'), t('status'), t('actions')].filter(Boolean).map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap ${i < (!job ? 6 : 5) ? 'border-r border-[#6e1515]' : ''} text-left`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, i) => (
                                    <tr key={app._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] ${i === applications.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-xs text-gray-400 font-mono border-b border-gray-100">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                    {getInitials(app.seekerId?.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#1A1A1A]">{app.seekerId?.name || t('applicant')}</p>
                                                    <p className="text-xs text-gray-400">{app.seekerId?.email || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {!job && (
                                            <td className="py-3 px-4 border-b border-gray-100">
                                                <p className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">{app.jobId?.title || t('unknown_job', { defaultValue: 'Unknown Job' })}</p>
                                            </td>
                                        )}
                                        <td className="py-3 px-4 text-xs text-gray-500 font-mono border-b border-gray-100">{fmtDate(app.createdAt, i18n)}</td>
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
                                        <td className="py-3 px-4 border-b border-gray-100 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <select value={app.status} onChange={e => handleStatusChange(app._id, e.target.value)}
                                                    className="border border-gray-300 text-xs px-2 py-1 focus:border-[#8B1A1A] focus:outline-none bg-white">
                                                    <option value="APPLIED">{t('status_labels.APPLIED')}</option>
                                                    <option value="REVIEWED">{t('status_labels.REVIEWED')}</option>
                                                    <option value="ACCEPTED">{t('status_labels.ACCEPTED')}</option>
                                                    <option value="REJECTED">{t('status_labels.REJECTED')}</option>
                                                </select>
                                                <button onClick={() => setViewApplicant(app.seekerId)} className="text-[10px] px-2 py-1.5 uppercase font-bold tracking-wider bg-[#FAF7F2] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white border border-[#8B1A1A] transition-colors">
                                                    {t('dash_my_profile').toUpperCase()}
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
            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6">
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('total')} <span className="text-[#E2B325] font-bold ml-1">{totalApps}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('applied')} <span className="text-[#E2B325] font-bold ml-1">{appliedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('reviewed')} <span className="text-[#E2B325] font-bold ml-1">{reviewedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('accepted')} <span className="text-[#E2B325] font-bold ml-1">{acceptedCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">{t('rejected')} <span className="text-[#E2B325] font-bold ml-1">{rejectedCount}</span></span>
            </div>

            <ApplicantProfileModal
                isOpen={!!viewApplicant}
                applicant={viewApplicant}
                onClose={() => setViewApplicant(null)}
            />
        </>
    );
};



export const CompanyProfilePage = () => {
    const { t } = useTranslation();

    const companySchema = yup.object({
        businessName: yup.string().required(t('err_business_req', { defaultValue: 'Business name is required' })),
        description: yup.string(),
        district: yup.string().required(t('err_district_req')),
        town: yup.string(),
        contactPhone: yup.string().required(t('err_phone_req')).matches(phoneRegex, t('err_phone_invalid')),
        contactWhatsApp: yup.string().test('is-valid-whatsapp', t('err_phone_invalid'), value => {
            if (!value) return true; // Optional field
            return phoneRegex.test(value);
        }),
    });
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
                toast.success(t('profile_updated_success', { defaultValue: 'Profile updated!' }));
                setEditing(false);
            } else {
                const res = await companiesAPI.createCompany(data);
                setCompany(res.data?.company || res.data);
                toast.success(t('company_created_success', { defaultValue: 'Company profile created!' }));
                setEditing(false);
            }
        } catch (error) {
            console.error('Company save error:', error);
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
            toast.success(t('company_deleted_success', { defaultValue: 'Company profile deleted' }));
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error(t('error_delete_profile', { defaultValue: 'Failed to delete' }));
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

    const VerificationBanner = () => {
        if (!company) return (
            <div className="bg-[#E2B325] border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#8B1A1A]" />
                <span className="text-[#8B1A1A] text-sm font-semibold">{t('create_profile_desc', { defaultValue: 'Create your company profile below' })}</span>
            </div>
        );
        if (company.verificationStatus === 'PENDING') return (
            <div className="bg-orange-50 border-l-4 border-l-orange-500 px-5 py-3 mb-5 flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-orange-800 text-sm font-semibold">{t('company_pending')}</span>
            </div>
        );
        if (company.verificationStatus === 'VERIFIED') return (
            <div className="bg-green-50 border-l-4 border-l-green-600 px-5 py-3 mb-5 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">{t('company_verified')}</span>
            </div>
        );
        if (company.verificationStatus === 'REJECTED') return (
            <div className="bg-red-50 border-l-4 border-l-[#8B1A1A] px-5 py-3 mb-5 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-[#8B1A1A]" />
                <span className="text-[#8B1A1A] text-sm font-semibold">{t('company_rejected')}</span>
            </div>
        );
        return null;
    };

    if (editing || !company) {
        return (
            <>
                <PageHeader
                    title={t('company').toUpperCase()}
                    subtitle={t('manage_business_desc', { defaultValue: 'Manage your business information' })}
                    rightSlot={company ? <button onClick={() => { setEditing(false); reset(company); }} className="border border-white/40 text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-white/10">{t('cancel')}</button> : null}
                />
                <VerificationBanner />
                <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A]">
                    <div className="bg-[#FAF7F2] border-b border-gray-200 px-6 py-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#8B1A1A]">
                            {company ? t('edit_company_profile', { defaultValue: 'EDIT COMPANY PROFILE' }) : t('create_company_profile', { defaultValue: 'CREATE COMPANY PROFILE' })}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FieldWrap label={t('business_name_label')} required error={errors.businessName?.message} className="md:col-span-2">
                            <input className={inputCls(errors.businessName)} placeholder={t('business_name_ph', { defaultValue: 'e.g. Green Valley Farms' })} {...register('businessName')} />
                        </FieldWrap>
                        <FieldWrap label={t('description_label')} className="md:col-span-2">
                            <textarea className={`${inputCls()} min-h-[100px] resize-y`} placeholder={t('company_desc_ph', { defaultValue: 'Tell us about your company...' })} {...register('description')} />
                        </FieldWrap>
                        <FieldWrap label={t('district')} required error={errors.district?.message}>
                            <select className={`${inputCls(errors.district)} cursor-pointer`} {...register('district')}>
                                <option value="">{t('select_district')}</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </FieldWrap>
                        <FieldWrap label={t('town')}><input className={inputCls()} placeholder={t('town_ph')} {...register('town')} /></FieldWrap>
                        <FieldWrap label={t('job_contact_phone')} required error={errors.contactPhone?.message}>
                            <input className={inputCls(errors.contactPhone)} placeholder="077 123 4567" {...register('contactPhone')} />
                        </FieldWrap>
                        <FieldWrap label="WhatsApp"><input className={inputCls()} placeholder="077 123 4567" {...register('contactWhatsApp')} /></FieldWrap>
                        <div className="md:col-span-2 border-t border-gray-200 pt-5 flex items-center justify-between mt-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">* {t('fields_required_label')}</span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {t('company_logo_hint', { defaultValue: 'Looking to add your Company Logo? Upload it on your' })} <Link to="/profile" className="text-[#8B1A1A] underline font-semibold hover:text-[#6e1515]">{t('dash_my_profile')}</Link>
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {company && <button type="button" onClick={() => { setEditing(false); reset(company); }} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50">{t('cancel')}</button>}
                                <button type="submit" disabled={submitting} className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50">
                                    {submitting ? t('wait') : company ? t('save_changes').toUpperCase() : t('create_profile_btn').toUpperCase()}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </>
        );
    }

    const vBadge = { PENDING: 'bg-orange-500 text-white', VERIFIED: 'bg-green-700 text-white', REJECTED: 'bg-[#8B1A1A] text-white' };

    return (
        <>
            <PageHeader
                title={t('company').toUpperCase()}
                subtitle={t('manage_business_desc')}
                rightSlot={<button onClick={() => setEditing(true)} className="border border-white/40 text-white text-xs uppercase tracking-wider px-4 py-2 hover:bg-white/10">{t('update_profile_btn').toUpperCase()}</button>}
            />
            <VerificationBanner />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left — Company Card */}
                <SectionCard title={t('company').toUpperCase()}>
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 bg-[#8B1A1A] text-white text-3xl font-bold flex items-center justify-center mt-2">
                            {company.businessName?.charAt(0) || 'C'}
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] text-center mt-3 font-['Playfair_Display']">{company.businessName}</h3>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider mt-1 ${vBadge[company.verificationStatus] || 'bg-gray-200 text-gray-600'}`}>
                            {t(`status_labels.${company.verificationStatus}`, { defaultValue: company.verificationStatus })}
                        </span>
                        <button onClick={() => setDeleteModalOpen(true)} className="text-xs text-red-400 hover:text-red-600 uppercase tracking-wider mt-4 cursor-pointer flex items-center gap-1">
                            <Trash2 size={12} /> {t('delete_company', { defaultValue: 'DELETE COMPANY' })}
                        </button>
                    </div>
                </SectionCard>

                {/* Right — Details Card */}
                <div className="md:col-span-2">
                    <SectionCard title={t('job_details').toUpperCase()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {[
                                { label: t('district'), value: company.district },
                                { label: t('town'), value: company.town },
                                { label: t('job_contact_phone'), value: company.contactPhone },
                                { label: 'WhatsApp', value: company.contactWhatsApp },
                            ].map(f => (
                                <div key={f.label} className="flex flex-col gap-0.5 py-3 border-b border-gray-100 px-2">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">{f.label}</span>
                                    <span className="text-sm font-medium text-[#1A1A1A]">{f.value || '—'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <span className="text-xs text-gray-400 uppercase tracking-wider">{t('about_company', { defaultValue: 'ABOUT YOUR COMPANY' })}</span>
                            <div className="text-sm text-gray-600 leading-relaxed bg-[#FAF7F2] p-4 mt-2">
                                {company.description || '—'}
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>

            <ConfirmModal isOpen={deleteModalOpen} title={t('delete_company', { defaultValue: 'Delete Company' })} message={t('delete_company_msg', { defaultValue: 'Are you sure you want to delete your company profile? This action cannot be undone.' })}
                onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} loading={deleteLoading} />
        </>
    );
};
