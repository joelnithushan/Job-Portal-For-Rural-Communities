import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Phone, Briefcase, ArrowLeft, CheckCircle, Building, Search, Bookmark } from 'lucide-react';
import { jobsAPI, applicationsAPI, companiesAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { formatSalary, formatDate, timeAgo } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import { useTranslation } from 'react-i18next';

export const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const { isJobSaved, toggleSaveJob } = useSavedJobs();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await jobsAPI.getJobById(id);
                const jobData = res.data?.job || res.data || res;
                setJob(jobData);

                if (user?.role === 'JOB_SEEKER') {
                    try {
                        const appsRes = await applicationsAPI.getMyApplications();
                        const apps = appsRes.data?.applications || appsRes.data || [];
                        const alreadyApplied = apps.some(a =>
                            (a.jobId?._id || a.jobId) === id
                        );
                        setHasApplied(alreadyApplied);
                    } catch { /* ignore */ }
                }
            } catch (error) {
                toast.error(t('job_not_found'));
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, user]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
            return;
        }
        setApplying(true);
        try {
            await applicationsAPI.applyToJob({ jobId: id });
            setHasApplied(true);
            toast.success(t('applied_success_msg'));
        } catch (error) {
            const msg = error.response?.data?.message || t('failed_apply_msg');
            if (msg.includes('INCOMPLETE_PROFILE')) {
                toast.error(t('complete_profile_msg'));
                navigate('/profile');
                return;
            }
            if (error.response?.status === 409 || msg.toLowerCase().includes('already')) {
                setHasApplied(true);
            }
            toast.error(msg);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1A1A]"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-heading font-bold text-brand-dark mb-4">{t('job_not_found')}</h1>
                <p className="text-gray-500 mb-6">{t('job_not_found_desc')}</p>
                <Link to="/jobs"><Button variant="primary">{t('job_browse_btn')}</Button></Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Back link */}
            <Link to="/jobs" className="inline-flex items-center gap-2 text-xs text-[#8B1A1A] font-bold uppercase tracking-widest hover:underline mb-8">
                <ArrowLeft size={16} /> {t('job_back')}
            </Link>

            <div className="bg-white border border-gray-200 overflow-hidden mb-8">
                <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest">{t('job_details_title')}</h2>
                </div>
                <div className="p-6 md:p-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] uppercase tracking-tight mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Building size={14} className="text-[#E2B325]" /> {job.employerId?.name || 'Company'}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#E2B325]" /> {job.district}{job.town ? `, ${job.town}` : ''}</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#E2B325]" /> {timeAgo(job.createdAt, t)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex flex-wrap items-center justify-end gap-3">
                            {user && (
                                <button
                                    onClick={() => {
                                        const wasSaved = isJobSaved(job._id || job.id);
                                        toggleSaveJob(job._id || job.id);
                                        if (!wasSaved) {
                                            toast.success(t('job_saved_msg', { defaultValue: 'Job saved successfully!' }));
                                        } else {
                                            toast.success(t('job_unsaved_msg', { defaultValue: 'Job removed from saved collection' }));
                                        }
                                    }}
                                    className={`p-3 border ${
                                        isJobSaved(job._id || job.id)
                                        ? 'bg-[#8B1A1A]/10 border-[#8B1A1A] text-[#8B1A1A]'
                                        : 'bg-white border-gray-200 text-gray-400 hover:border-[#8B1A1A] hover:text-[#8B1A1A]'
                                    } transition-colors`}
                                    title={isJobSaved(job._id || job.id) ? t('job_unsave') : t('job_save')}
                                >
                                    <Bookmark size={20} className={isJobSaved(job._id || job.id) ? "fill-current" : ""} />
                                </button>
                            )}
                            {user?.role === 'JOB_SEEKER' ? (
                                hasApplied ? (
                                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
                                        <CheckCircle size={16} /> {t('job_applied_status')} ✓
                                    </span>
                                ) : (
                                    <button onClick={handleApply} className="bg-[#8B1A1A] text-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#6e1515] transition-colors disabled:opacity-50">
                                        {applying ? t('job_apply_wait') : t('job_apply_now')}
                                    </button>
                                )
                            ) : !user ? (
                                <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }}>
                                    <button className="bg-[#8B1A1A] text-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#6e1515] transition-colors">{t('job_login_to_apply')}</button>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* Job Meta Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#FAF7F2] p-4 text-center border-l-2 border-[#E2B325]">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">{t('job_type_label')}</p>
                            <p className="font-bold text-[#1A1A1A] text-[11px] uppercase">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</p>
                        </div>
                        <div className="bg-[#FAF7F2] p-4 text-center border-l-2 border-[#E2B325]">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">{t('category')}</p>
                            <p className="font-bold text-[#1A1A1A] text-[11px] uppercase">{job.category || t('filter_any_category')}</p>
                        </div>
                        <div className="bg-[#FAF7F2] p-4 text-center border-l-2 border-[#E2B325]">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">{t('job_salary_label')}</p>
                            <p className="font-bold text-[#8B1A1A] text-[11px] uppercase">{formatSalary(job.salaryMin, job.salaryMax, t)}</p>
                        </div>
                        <div className="bg-[#FAF7F2] p-4 text-center border-l-2 border-[#E2B325]">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">{t('job_status_label')}</p>
                            <p className={`font-bold text-[11px] uppercase ${job.status === 'OPEN' ? 'text-green-600' : 'text-gray-400'}`}>
                                {job.status}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{t('job_desc_title')}</h2>
                        <div className="text-[#1A1A1A] leading-relaxed whitespace-pre-line text-sm">{job.description}</div>
                    </div>

                    {/* Contact */}
                    {job.contactPhone && (
                        <div className="bg-[#FAF7F2] p-5 flex items-center gap-4 border border-gray-100">
                            <div className="bg-[#8B1A1A]/10 p-2"><Phone size={18} className="text-[#8B1A1A]" /></div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('job_contact_phone')}</p>
                                <p className="font-bold text-[#1A1A1A] text-sm uppercase">{job.contactPhone}</p>
                            </div>
                        </div>
                    )}

                    {/* Posted date */}
                    <p className="mt-6 text-sm text-gray-400">
                        {t('job_posted_on')} {formatDate(job.createdAt, i18n)}
                    </p>
                </div>
            </div>
        </div>
    );
};


export const CompaniesPage = () => {
    const { t } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const jobsRes = await jobsAPI.getJobs({ limit: 100 });
                const jobs = jobsRes.data?.jobs || jobsRes.data || [];
                const companyMap = {};
                jobs.forEach(job => {
                    const emp = job.employerId;
                    if (emp && emp._id && !companyMap[emp._id]) {
                        companyMap[emp._id] = {
                            _id: emp._id,
                            businessName: emp.name || 'Unknown Company',
                            district: job.district,
                            logo: emp.profilePicture,
                            jobCount: 1
                        };
                    } else if (emp && emp._id && companyMap[emp._id]) {
                        companyMap[emp._id].jobCount++;
                    }
                });
                setCompanies(Object.values(companyMap));
            } catch (error) {
                console.error('Could not load companies', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const filtered = companies.filter(c =>
        (c.businessName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1A1A]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            <div className="bg-white border border-gray-200 overflow-hidden mb-6">
                <div className="bg-[#8B1A1A] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        {t('companies_title')}
                    </h2>
                    <div className="relative max-w-sm w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 z-10" />
                        <input
                            type="text"
                            placeholder={t('companies_search_ph')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[#6e1515] border border-[#E2B325]/30 text-white placeholder-gray-300 focus:outline-none focus:border-[#E2B325] text-[10px] font-bold uppercase tracking-wider transition-colors"
                        />
                    </div>
                </div>

                <div className="p-5">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Building size={40} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-500">{t('companies_empty_title')}</h3>
                            <p className="text-gray-400 mt-1">{t('companies_empty_desc')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(company => (
                                <Link to={`/companies/${company._id}/jobs`} key={company._id} className="block bg-white border border-gray-100 p-6 border-l-4 border-l-[#E2B325] hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.businessName || company.name} className="w-12 h-12 object-cover rounded-none border border-gray-100" />
                                        ) : (
                                            <div className="w-12 h-12 bg-[#8B1A1A]/5 flex items-center justify-center text-[#8B1A1A] font-bold text-lg rounded-none border border-[#8B1A1A]/10">
                                                {(company.businessName || company.name || 'C').charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-brand-dark">{company.businessName || company.name}</h3>
                                            {company.district && (
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <MapPin size={12} /> {company.district}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {company.description && (
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{company.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        {company.verificationStatus === 'VERIFIED' && (
                                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                <CheckCircle size={12} /> {t('companies_verified')}
                                            </span>
                                        )}
                                        {company.jobCount && (
                                            <span className="text-[10px] text-[#8B1A1A] font-bold bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 px-2 py-0.5 uppercase tracking-wider">
                                                {company.jobCount} {t('companies_open_positions')}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
