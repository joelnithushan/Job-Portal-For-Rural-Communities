import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Phone, Briefcase, ArrowLeft, CheckCircle, Building, Search } from 'lucide-react';
import { jobsAPI, applicationsAPI, companiesAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { formatSalary, formatDate, timeAgo } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

// ─── JOB DETAIL PAGE ──────────────────────────────────────────
export const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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

                // Check if current user already applied
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
                toast.error('Job not found');
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
            toast.success('Applied successfully!');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to apply';
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
                <h1 className="text-3xl font-heading font-bold text-brand-dark mb-4">Job Not Found</h1>
                <p className="text-gray-500 mb-6">This job may have been removed or doesn't exist.</p>
                <Link to="/jobs"><Button variant="primary">Browse Jobs</Button></Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            {/* Back link */}
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-brand-green font-semibold hover:underline mb-6">
                <ArrowLeft size={16} /> Back to Jobs
            </Link>

            <div className="bg-white border border-gray-100 shadow-sm p-6 md:p-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-brand-dark mb-3">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Building size={14} /> {job.employerId?.name || 'Company'}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.district}{job.town ? `, ${job.town}` : ''}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(job.createdAt)}</span>
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="shrink-0">
                        {user?.role === 'JOB_SEEKER' ? (
                            hasApplied ? (
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 font-semibold text-sm border border-green-200">
                                    <CheckCircle size={16} /> Applied ✓
                                </span>
                            ) : (
                                <Button variant="primary" size="lg" loading={applying} onClick={handleApply}>
                                    APPLY NOW
                                </Button>
                            )
                        ) : !user ? (
                            <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }}>
                                <Button variant="primary" size="lg">LOGIN TO APPLY</Button>
                            </Link>
                        ) : null}
                    </div>
                </div>

                {/* Job Meta Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Type</p>
                        <p className="font-semibold text-brand-dark text-sm">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                        <p className="font-semibold text-brand-dark text-sm">{job.category || 'General'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Salary</p>
                        <p className="font-semibold text-brand-dark text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                        <p className={`font-semibold text-sm ${job.status === 'OPEN' ? 'text-green-600' : 'text-gray-400'}`}>
                            {job.status}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-lg font-heading font-semibold text-brand-dark mb-4">Job Description</h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</div>
                </div>

                {/* Contact */}
                {job.contactPhone && (
                    <div className="bg-gray-50 p-5 flex items-center gap-3">
                        <Phone size={18} className="text-brand-green" />
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Contact Phone</p>
                            <p className="font-semibold text-brand-dark">{job.contactPhone}</p>
                        </div>
                    </div>
                )}

                {/* Posted date */}
                <p className="mt-6 text-sm text-gray-400">
                    Posted on {formatDate(job.createdAt)}
                </p>
            </div>
        </div>
    );
};


// ─── COMPANIES PAGE ────────────────────────────────────────────
export const CompaniesPage = () => {
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
            <div className="mb-8">

                {/* Search */}
                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Building size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500">No companies found</h3>
                    <p className="text-gray-400 mt-1">Try a different search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(company => (
                        <div key={company._id} className="bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                {company.logo ? (
                                    <img src={company.logo} alt={company.businessName || company.name} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-100" />
                                ) : (
                                    <div className="w-12 h-12 bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-lg rounded">
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
                                        <CheckCircle size={12} /> Verified
                                    </span>
                                )}
                                {company.jobCount && (
                                    <span className="text-xs text-gray-400">{company.jobCount} active job{company.jobCount > 1 ? 's' : ''}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
