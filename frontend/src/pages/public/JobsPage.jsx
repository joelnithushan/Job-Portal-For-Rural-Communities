import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { jobsAPI } from '../../api/services';
import { JobCard } from '../../components/jobs/JobCard';
import { JobFilters } from '../../components/jobs/JobFilters';
import { JobCardSkeleton } from '../../components/jobs/JobCardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { useSavedJobs } from '../../hooks/useSavedJobs';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';

import { MOCK_JOBS } from '../../utils/mockData';

export const JobsPage = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    
    const { isJobSaved, toggleSaveJob } = useSavedJobs();

    const [filters, setFilters] = useState({
        search: '',
        district: null,
        category: null,
        type: null,
        salaryMin: null,
        salaryMax: null,
        nearMe: false,
        radius: 5,
        page: 1,
        limit: 10,
        sort: 'newest'
    });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let response;
            if (filters.nearMe) {
                if (!filters.coords) {
                    setJobs([]);
                    setTotal(0);
                    setLoading(false);
                    return; // Wait for JobFilters to supply coords
                }
                response = await jobsAPI.getNearbyJobs({
                    lat: filters.coords.lat,
                    lng: filters.coords.lng,
                    radiusKm: filters.radius || 5,
                });
            } else {
                const apiParams = {};
                if (filters.district) apiParams.district = filters.district;
                if (filters.category) apiParams.category = filters.category;
                if (filters.type) apiParams.jobType = filters.type;
                if (filters.search) apiParams.search = filters.search;
                if (filters.sort) apiParams.sort = filters.sort;
                if (filters.salaryMin) apiParams.salaryMin = filters.salaryMin;
                if (filters.salaryMax) apiParams.salaryMax = filters.salaryMax;
                apiParams.page = filters.page;
                apiParams.limit = filters.limit;
                response = await jobsAPI.getJobs(apiParams);
            }

            const jobsData = response.data?.jobs || response.data || [];
            const totalCount = response.data?.total || jobsData.length || 0;
            const totalPagesCount = response.data?.totalPages || Math.ceil(totalCount / filters.limit);

            setJobs(jobsData);
            setTotal(totalCount);
            setTotalPages(totalPagesCount);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
            setJobs([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            search: '', district: null, category: null, type: null,
            salaryMin: null, salaryMax: null, nearMe: false,
            radius: 5, page: 1, limit: 10, sort: 'newest'
        });
    };

    const activeFilterCount = Object.entries(filters).filter(([key, value]) =>
        !['page', 'limit', 'sort', 'radius'].includes(key) && !!value
    ).length;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, filters.page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-4 pb-8 md:pt-6 md:pb-12">
            <SEO 
                title={t('jobs_seo_title') || "Find Jobs"} 
                description={t('jobs_seo_description') || "Browse and search for jobs in various sectors across Sri Lanka."}
            />
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex items-center justify-between bg-white p-4 border border-gray-200">
                        <span className="font-semibold text-[#1A1A1A] uppercase tracking-wider text-xs">{t('filter_title')}</span>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="relative border-[#8B1A1A] text-[#8B1A1A] rounded-none hover:bg-[#8B1A1A] hover:text-white"
                        >
                            <Filter size={18} className="mr-2" />
                            {t('filter_mobile_btn')}
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#8B1A1A] text-white text-[10px] font-bold rounded-none flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <JobFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={clearFilters}
                            isLoading={loading}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 overflow-hidden mb-6">
                            <div className="bg-[#8B1A1A] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    {t('jobs_available')} ({total})
                                    {totalPages > 1 && (
                                        <span className="text-[10px] text-[#E2B325]/70 font-normal ml-2">
                                            ({t('jobs_page')} {filters.page} {t('jobs_of')} {totalPages})
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-[#E2B325] font-bold uppercase tracking-widest shrink-0">{t('jobs_sort_by')}</span>
                                    <select
                                        className="bg-[#6e1515] border border-[#E2B325]/30 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 block focus:outline-none focus:border-[#E2B325] transition-colors cursor-pointer"
                                        value={filters.sort}
                                        onChange={(e) => handleFilterChange({ sort: e.target.value })}
                                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    >
                                        <option value="newest">{t('jobs_sort_newest')}</option>
                                        <option value="salaryDesc">{t('jobs_sort_salary_desc')}</option>
                                        <option value="salaryAsc">{t('jobs_sort_salary_asc')}</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="p-5">

                        {/* Job List */}
                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <>
                                    {[...Array(5)].map((_, i) => <JobCardSkeleton key={i} />)}
                                </>
                            ) : jobs.length === 0 ? (
                                <EmptyState
                                    icon={Filter}
                                    title={t('jobs_empty_title')}
                                    description={t('jobs_empty_desc')}
                                    action={<Button variant="outline" onClick={clearFilters}>{t('jobs_clear_filters')}</Button>}
                                    className="my-8"
                                />
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                    }}
                                    className="flex flex-col gap-4"
                                >
                                    {jobs.map(job => (
                                        <JobCard 
                                            key={job._id || job.id} 
                                            job={job} 
                                            isSaved={isJobSaved(job._id || job.id)}
                                            onSaveToggle={toggleSaveJob}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={filters.page === 1}
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        {t('pagination_prev')}
                                    </Button>

                                    {getPageNumbers()[0] > 1 && (
                                        <>
                                            <button
                                                onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                                                className="w-9 h-9 rounded-lg text-sm font-medium text-brand-muted hover:bg-brand-cream transition-colors"
                                            >
                                                1
                                            </button>
                                            {getPageNumbers()[0] > 2 && (
                                                <span className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                                            )}
                                        </>
                                    )}

                                    {getPageNumbers().map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                                filters.page === pageNum
                                                    ? 'bg-brand-terra text-white shadow-sm'
                                                    : 'text-brand-muted hover:bg-brand-cream'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                        <>
                                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                                <span className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => setFilters(prev => ({ ...prev, page: totalPages }))}
                                                className="w-9 h-9 rounded-lg text-sm font-medium text-brand-muted hover:bg-brand-cream transition-colors"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={filters.page >= totalPages}
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        {t('pagination_next')}
                                    </Button>
                                </div>
                            </div>
                        )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Filters Modal */}
            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl h-[85vh] flex flex-col lg:hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <h3 className="font-heading font-semibold text-lg">{t('filter_title')}</h3>
                                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 shrink-0">
                                <JobFilters
                                    filters={filters}
                                    onFilterChange={(f) => { handleFilterChange(f); setIsMobileFiltersOpen(false); }}
                                    onClear={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                                    isLoading={loading}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
};
