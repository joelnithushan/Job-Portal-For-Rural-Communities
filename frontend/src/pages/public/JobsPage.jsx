import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { jobsAPI } from '../../api/services';
import { JobCard } from '../../components/jobs/JobCard';
import { JobFilters } from '../../components/jobs/JobFilters';
import { JobCardSkeleton } from '../../components/jobs/JobCardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

// Fallback Mock Data
import { MOCK_JOBS } from '../../utils/mockData';

export const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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
            if (filters.nearMe && window.lastKnownCoords) {
                response = await jobsAPI.getNearbyJobs({
                    lat: window.lastKnownCoords.lat,
                    lng: window.lastKnownCoords.lng,
                    radiusKm: filters.radius,
                });
            } else {
                // Only send params the backend accepts
                const apiParams = {};
                if (filters.district) apiParams.district = filters.district;
                if (filters.category) apiParams.category = filters.category;
                if (filters.type) apiParams.jobType = filters.type;
                apiParams.page = filters.page;
                apiParams.limit = filters.limit;
                response = await jobsAPI.getJobs(apiParams);
            }

            let jobsData = response.data?.jobs || response.data || [];
            const totalCount = response.data?.total || jobsData.length || 0;

            // Client-side search filter
            if (filters.search) {
                const q = filters.search.toLowerCase();
                jobsData = jobsData.filter(j =>
                    j.title?.toLowerCase().includes(q) ||
                    j.district?.toLowerCase().includes(q) ||
                    j.category?.toLowerCase().includes(q)
                );
            }

            setJobs(jobsData);
            setTotal(totalCount);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
            setJobs([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div className="min-h-screen bg-brand-cream/40 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-green mb-4">Find Your Next Job</h1>
                    <p className="text-brand-muted max-w-2xl text-lg">Browse local opportunities in your district and apply instantly.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                        <span className="font-semibold text-brand-dark">Filters</span>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="relative"
                        >
                            <Filter size={18} className="mr-2" />
                            Show Filters
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-terra text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
                    <div className="flex-1 min-w-0 flex flex-col gap-6">

                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="font-semibold text-brand-dark">
                                <span className="text-brand-terra font-bold">{total}</span> Jobs Found
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-brand-muted shrink-0">Sort by:</span>
                                <select
                                    className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-terra/50 outline-none transition-colors"
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="salaryDesc">Salary: High to Low</option>
                                    <option value="salaryAsc">Salary: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {/* Job List */}
                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <>
                                    {[...Array(5)].map((_, i) => <JobCardSkeleton key={i} />)}
                                </>
                            ) : jobs.length === 0 ? (
                                <EmptyState
                                    icon={Filter}
                                    title="No jobs found"
                                    description="We couldn't find any jobs matching your current filters. Try broadening your search or clearing some filters."
                                    action={<Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>}
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
                                        <JobCard key={job._id || job.id} job={job} />
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Pagination (Simple Example) */}
                        {!loading && total > filters.limit && (
                            <div className="flex justify-center mt-8">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={filters.page === 1}
                                        onClick={() => handleFilterChange({ page: filters.page - 1 })}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center justify-center w-10 font-medium text-brand-terra border-b-2 border-brand-terra">
                                        {filters.page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={filters.page * filters.limit >= total}
                                        onClick={() => handleFilterChange({ page: filters.page + 1 })}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
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
                                <h3 className="font-heading font-semibold text-lg">Filters</h3>
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
