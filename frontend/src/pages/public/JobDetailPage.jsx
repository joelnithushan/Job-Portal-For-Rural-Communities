import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    MapPin, Clock, Briefcase, Share2, Heart,
    CheckCircle, ChevronRight, Check, AlertCircle, FileText, UploadCloud, X
} from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { getInitials, formatSalary, timeAgo, formatDate } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

// Fallback Mock Data
import { MOCK_JOBS } from '../../utils/mockData';

export const JobDetailPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [cvFile, setCvFile] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const response = await jobsAPI.getJobById(id);
                const jobData = response.data || response;
                setJob(jobData);

                // Also check if user has already applied/saved if logged in
                if (isAuthenticated && user?.role === 'JOB_SEEKER') {
                    // We might ordinarily call a specific endpoint like GET /applications/me/?jobId=X
                    // or check a local context store. Mocking this state for now:
                    setHasApplied(false);
                }

            } catch (error) {
                console.warn("API Error, falling back to mock jobs", error);
                const mockJob = MOCK_JOBS.find(j => j._id === id || j.id === id);
                if (mockJob) setJob(mockJob);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, isAuthenticated, user]);

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to apply for this job.');
            return;
        }
        if (user?.role !== 'JOB_SEEKER') {
            toast.error('Only Job Seekers can apply for jobs.');
            return;
        }

        if (!user?.nic || !user?.phone || !user?.district) {
            toast.error('Incomplete Profile! Please complete your profile (NIC, Phone, District) in Profile settings first.');
            return;
        }

        setShowApplyModal(true);
    };

    const submitApplication = async () => {
        if (job.cvRequired && !cvFile) {
            toast.error('A CV is required to apply for this job.');
            return;
        }

        setIsApplying(true);
        try {
            let cvUrlStr = null;
            if (cvFile) {
                const formData = new FormData();
                formData.append('cv', cvFile);
                const uploadRes = await applicationsAPI.uploadCV(formData);
                cvUrlStr = uploadRes.data?.data?.cvUrl || uploadRes.data?.cvUrl || uploadRes.data?.data?.profilePicture; // fallback if needed
            }

            await applicationsAPI.applyToJob({ jobId: id, cvUrl: cvUrlStr });
            toast.success('Successfully applied for this job!');
            setHasApplied(true);
            setShowApplyModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: `Check out this job on RuralWork: ${job?.title} at ${job?.companyId?.name}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream/40 flex items-center justify-center">
                <Spinner size="lg" className="text-brand-green" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-brand-cream/40 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <h2 className="text-2xl font-heading font-bold text-brand-dark mb-2">Job Not Found</h2>
                <p className="text-brand-muted mb-6">The job you are looking for does not exist or has been removed.</p>
                <Link to="/jobs">
                    <Button variant="primary">Back to Jobs</Button>
                </Link>
            </div>
        );
    }

    const company = job.companyId || {};

    return (
        <div className="min-h-screen bg-brand-cream/40 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4">

                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-brand-muted mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <Link to="/" className="hover:text-brand-dark transition-colors">Home</Link>
                    <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                    <Link to="/jobs" className="hover:text-brand-dark transition-colors">Jobs</Link>
                    <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                    <Link
                        to={`/jobs?category=${job.category}`}
                        className="hover:text-brand-dark transition-colors"
                    >
                        {job.category}
                    </Link>
                    <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                    <span className="text-brand-dark font-medium truncate max-w-[200px]">{job.title}</span>
                </nav>

                {/* Hero Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8 relative overflow-hidden">
                    {/* Decorative absolute element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        {/* Avatar */}
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl bg-brand-cream border border-gray-200 flex items-center justify-center overflow-hidden">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-heading font-bold text-brand-green">
                                    {getInitials(company.name || 'Company')}
                                </span>
                            )}
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-green mb-2">
                                        {job.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-lg text-brand-dark font-medium mb-4">
                                        {company.name}
                                        {company.isVerified && (
                                            <CheckCircle size={18} className="text-brand-terra" aria-label="Verified Company" />
                                        )}
                                    </div>
                                </div>

                                {/* Status/Deadline */}
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <Badge status={job.status} />
                                    {job.deadline && (
                                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
                                            Closes: {formatDate(job.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tags Row */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-brand-muted mb-8">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">{job.district}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Briefcase size={16} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">{JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Posted {timeAgo(job.createdAt)}</span>
                                </div>
                            </div>

                            {/* Salary & Actions Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Offered Salary</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {formatSalary(job.salaryMin, job.salaryMax)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        className="flex-shrink-0"
                                        onClick={() => setIsSaved(!isSaved)}
                                        aria-label="Save Job"
                                    >
                                        <Heart size={20} className={isSaved ? "fill-brand-terra text-brand-terra" : ""} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-shrink-0"
                                        onClick={handleShare}
                                        aria-label="Share Job"
                                    >
                                        <Share2 size={20} />
                                    </Button>

                                    {job.status === 'OPEN' && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="flex-1 sm:w-48 shadow-md"
                                            onClick={handleApplyClick}
                                            disabled={hasApplied}
                                        >
                                            {hasApplied ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Check size={18} /> Applied
                                                </span>
                                            ) : 'Apply Now'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Job Description */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-heading font-bold text-brand-dark mb-6">About This Role</h3>

                            <div className="prose prose-brand max-w-none text-brand-muted">
                                {/* Fallback to split if rich HTML isn't used */}
                                {job.description?.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                                ))}

                                {/* Fake content for visual purposes if description is short */}
                                {(!job.description || job.description.length < 100) && (
                                    <>
                                        <p className="mb-4 leading-relaxed">
                                            We are looking for a dedicated and hardworking individual to join our team. The ideal candidate will have a strong work ethic, the ability to work independently or as part of a team, and a commitment to quality.
                                        </p>
                                        <h4 className="text-lg font-heading font-semibold text-brand-dark mt-8 mb-4">Key Responsibilities</h4>
                                        <ul className="list-disc pl-5 space-y-2 mb-6">
                                            <li>Perform daily operational tasks assigned by the supervisor.</li>
                                            <li>Maintain a clean and safe working environment.</li>
                                            <li>Follow all company safety protocols and procedures.</li>
                                            <li>Report any issues or machinery malfunctions immediately.</li>
                                        </ul>
                                        <h4 className="text-lg font-heading font-semibold text-brand-dark mt-8 mb-4">Requirements</h4>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>Previous experience in a similar role is an advantage.</li>
                                            <li>Ability to perform physical labor if required.</li>
                                            <li>Strong communication skills in local languages.</li>
                                            <li>Willingness to learn and adapt to new processes.</li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-6">

                        {/* Company Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-heading font-bold text-brand-dark mb-4">About the Company</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                    <span className="font-heading font-bold text-gray-500">
                                        {company.name ? company.name.charAt(0) : 'C'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-dark">{company.name}</p>
                                    <p className="text-sm text-brand-muted">Member since {new Date(company.createdAt || Date.now()).getFullYear()}</p>
                                </div>
                            </div>
                            <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                                {company.description || "A trusted local business providing employment opportunities in the community."}
                            </p>
                            <Link to="/companies" className="text-brand-terra text-sm font-semibold hover:underline">
                                View Company Profile →
                            </Link>
                        </div>

                        {/* Job Overview Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-heading font-bold text-brand-dark mb-4">Job Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Posted on</span>
                                    <span className="text-sm font-medium">{formatDate(job.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Job Type</span>
                                    <span className="text-sm font-medium">{JOB_TYPE_LABELS[job.type] || job.type}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Category</span>
                                    <span className="text-sm font-medium">{job.category}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Location</span>
                                    <span className="text-sm font-medium">{job.district}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-500">Applicants</span>
                                    <span className="text-sm font-medium">{job.applicationsCount || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warning / Trust Box */}
                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                                <AlertCircle size={16} /> Safety Tips
                            </h4>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Never pay money to apply for a job or to attend an interview. RuralWork does not charge job seekers for applying to jobs on our platform.
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            {/* Application Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full relative">
                        <button 
                            onClick={() => setShowApplyModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-xl font-heading font-bold text-brand-dark mb-2">Submit Application</h3>
                        <p className="text-brand-muted text-sm mb-6">Review your application before submitting to {company?.name}.</p>

                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-[#8B1A1A]" /> 
                                CV Attachment {job.cvRequired && <span className="text-[#8B1A1A] text-xs">*Required</span>}
                            </h4>
                            <div className="flex flex-col gap-3">
                                <input 
                                    type="file" 
                                    id="cvUpload" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => setCvFile(e.target.files[0])}
                                />
                                {cvFile ? (
                                    <div className="flex items-center justify-between bg-white border border-[#E2B325] p-3 rounded-md">
                                        <span className="text-sm font-medium text-gray-800 truncate">{cvFile.name}</span>
                                        <button onClick={() => setCvFile(null)} className="text-red-500 hover:text-red-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="cvUpload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud size={24} className="text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500"><span className="font-semibold text-brand-tera cursor-pointer">Click to upload</span> your CV.</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end items-center">
                            <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                            <Button variant="primary" loading={isApplying} onClick={submitApplication}>
                                Confirm Application
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
