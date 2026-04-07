import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowLeft, DollarSign } from 'lucide-react';
import { jobsAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { formatSalary } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';
import { JobCard } from '../../components/jobs/JobCard';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import { useTranslation } from 'react-i18next';

export const CompanyJobsPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [jobs, setJobs] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isJobSaved, toggleSaveJob } = useSavedJobs();

    useEffect(() => {
        const fetchCompanyJobs = async () => {
            try {
                const res = await jobsAPI.getJobs({ limit: 100 });
                const allJobs = res.data?.jobs || res.data || [];
                
                const companyJobs = allJobs.filter(j => 
                    j.employerId && (j.employerId._id === id || j.employerId === id)
                );
                
                setJobs(companyJobs);

                if (companyJobs.length > 0 && companyJobs[0].employerId) {
                    setCompanyInfo({
                        name: companyJobs[0].employerId.name || companyJobs[0].employerId.businessName,
                        logo: companyJobs[0].employerId.profilePicture || null,
                        district: companyJobs[0].district
                    });
                }
            } catch (error) {
                console.error("Failed to load company jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanyJobs();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1A1A]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <Link to="/companies" className="inline-flex items-center gap-2 text-xs text-[#8B1A1A] font-bold uppercase tracking-widest hover:underline mb-8">
                <ArrowLeft size={16} /> {t('back_to_companies')}
            </Link>

            {companyInfo && (
                <div className="bg-white border border-gray-200 overflow-hidden mb-8">
                    <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white text-sm font-bold uppercase tracking-widest">{t('company_profile_title')}</h2>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {companyInfo.logo ? (
                        <img src={companyInfo.logo} alt={companyInfo.name} className="w-24 h-24 object-cover rounded-none border border-gray-100" />
                    ) : (
                        <div className="w-24 h-24 bg-[#8B1A1A]/5 flex items-center justify-center text-[#8B1A1A] font-bold text-3xl rounded-none border border-[#8B1A1A]/10">
                            {(companyInfo.name || 'C').charAt(0)}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-[#1A1A1A] uppercase tracking-tight mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{companyInfo.name}</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                            <MapPin size={14} className="text-[#E2B325]" /> {companyInfo.district || t('filter_all_districts')}
                        </p>
                    </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 overflow-hidden mb-8">
                <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                    <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={16} className="text-[#E2B325]" />
                        {t('open_positions_count', { count: jobs.length })}
                    </h2>
                </div>
                <div className="p-6 md:p-8">

            {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100">
                    <Briefcase size={40} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-500">{t('no_open_positions')}</h3>
                    <p className="text-gray-400 mt-1">{t('no_active_listings')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <JobCard 
                            key={job._id || job.id} 
                            job={job} 
                            isSaved={isJobSaved(job._id || job.id)}
                            onSaveToggle={toggleSaveJob}
                        />
                    ))}
                </div>
            )}
            </div>
            </div>
        </div>
    );
};
