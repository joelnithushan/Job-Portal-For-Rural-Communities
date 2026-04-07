import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Search, MapPin, Briefcase, Calendar, Filter, ExternalLink, ChevronLeft, ChevronRight, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const DiscoverJobsPage = () => {
    const { t, i18n } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters & Pagination
    const [what, setWhat] = useState('');
    const [where, setWhere] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('relevance');
    const [page, setPage] = useState(1);

    const categories = [
        { value: '', label: t('filter_any_category') },
        { value: 'it-jobs', label: 'IT & Development' },
        { value: 'sales-jobs', label: 'Sales & Marketing' },
        { value: 'hr-jobs', label: 'Human Resources' },
        { value: 'finance-jobs', label: 'Finance & Accounting' },
        { value: 'healthcare-nursing-jobs', label: 'Healthcare' },
        { value: 'education-jobs', label: 'Education' },
    ];

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/jooble/jobs', {
                params: {
                    what: what || undefined,
                    where: where || undefined,
                    category: category || undefined,
                    sort: sort || undefined,
                    page
                }
            });
            setJobs(res.data.results || []);
            setTotalCount(res.data.count || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to load external jobs. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [what, where, category, sort, page]);

    useEffect(() => {
        // Debounce fetching if purely typing, though we have a search button
        // For now, load initial page
        fetchJobs();
    }, [page, sort]); // Refresh when page or sort changes

    const handleSearch = (e) => {
        e.preventDefault();
        if (page !== 1) {
            setPage(1); // Reset page which triggers fetch
        } else {
            fetchJobs(); // Fetch directly
        }
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        // Assuming 10 per page
        if (page * 10 < totalCount) setPage(p => p + 1);
    };

    const formatSalary = (salaryString) => {
        if (!salaryString) return t('job_salary_not_specified');
        return salaryString;
    };

    const formatDate = (dateString, i18nObj) => {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return t('discover_recently');
        const locale = i18nObj?.language === 'si' ? 'si-LK' : i18nObj?.language === 'ta' ? 'ta-LK' : 'en-GB';
        return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-['Playfair_Display'] font-bold text-[#1A1A1A] flex items-center gap-2">
                        <Globe className="text-[#8B1A1A]" />
                        {t('discover_title')}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('discover_desc')}</p>
                </div>
                <div className="bg-[#E2B325]/10 px-4 py-2 border border-[#E2B325]/30 rounded flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#8B1A1A]">{t('discover_powered_by')}</span>
                    <span className="font-bold text-[#1A1A1A] text-lg tracking-tight">Jooble</span>
                </div>
            </div>

            {/* Search Filters Card */}
            <form onSubmit={handleSearch} className="bg-white p-6 shadow-sm border border-gray-100 mb-8 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* What */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{t('filter_search_label')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder={t('filter_search_ph')}
                                value={what}
                                onChange={(e) => setWhat(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-[#8B1A1A] rounded"
                            />
                        </div>
                    </div>

                    {/* Where */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{t('filter_location_label')}</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="City, state, zip..."
                                value={where}
                                onChange={(e) => setWhere(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-[#8B1A1A] rounded"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{t('filter_category_label')}</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-[#8B1A1A] bg-white appearance-none cursor-pointer rounded"
                            >
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-end">
                        <Button type="submit" variant="primary" className="w-full h-[42px] bg-[#8B1A1A] hover:bg-[#6e1515] text-[#E2B325] uppercase tracking-wide font-bold">
                            {t('discover_search_btn')}
                        </Button>
                    </div>
                </div>

                <div className="flex justify-start mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{t('jobs_sort_by')}</span>
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-transparent text-sm font-semibold border-none focus:ring-0 text-[#8B1A1A] cursor-pointer"
                        >
                            <option value="relevance">{t('discover_sort_relevance')}</option>
                            <option value="date">{t('discover_sort_date')}</option>
                        </select>
                    </div>
                </div>
            </form>

            {/* Results Section */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#1A1A1A]">
                    {isLoading ? t('discover_searching') : `${totalCount.toLocaleString()} ${t('discover_jobs_found')}`}
                </h2>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-6 rounded text-center flex flex-col items-center justify-center my-8">
                    <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                    <h3 className="text-red-800 font-bold mb-1">Something went wrong</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                    <Button onClick={fetchJobs} className="mt-4 bg-red-100 text-red-800 hover:bg-red-200 px-6 py-2 rounded">Try Again</Button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !error && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex flex-col md:flex-row gap-4 bg-white p-6 border border-gray-100 rounded">
                            <div className="h-16 w-16 bg-gray-200 rounded shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-gray-200 w-1/3 rounded"></div>
                                <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                                <div className="h-4 bg-gray-200 w-full rounded"></div>
                                <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                            </div>
                            <div className="w-32 flex flex-col gap-2 shrink-0">
                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && jobs.length === 0 && (
                <div className="bg-white border border-gray-100 p-12 text-center rounded">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{t('discover_no_jobs_title')}</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {t('discover_no_jobs_desc')}
                    </p>
                    <Button onClick={() => { setWhat(''); setWhere(''); setCategory(''); setPage(1); }} className="mt-6 border border-gray-300 text-gray-600 hover:bg-gray-50 uppercase tracking-widest text-xs px-6 py-3 rounded">
                        {t('jobs_clear_filters')}
                    </Button>
                </div>
            )}

            {/* Results List */}
            {!isLoading && !error && jobs.length > 0 && (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white p-6 border border-gray-100 shadow-sm hover:border-[#8B1A1A] transition-colors rounded group flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#8B1A1A] group-hover:text-[#6e1515] transition-colors mb-1 line-clamp-1">
                                    {job.title?.replace(/<[^>]+>/g, '')}
                                </h3>
                                <p className="text-[#1A1A1A] font-semibold text-sm mb-3">
                                    {job.company || t('discover_unknown_company')} <span className="mx-2 text-gray-300">•</span> {job.location || t('discover_location_not_specified')}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
                                        $$ {formatSalary(job.salary)}
                                    </span>
                                    {job.category && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                                            <Briefcase className="h-3 w-3" /> {job.category}
                                        </span>
                                    )}
                                    {job.contract_time && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                                            {job.contract_time.replace('_', ' ').toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {job.description?.replace(/<[^>]+>/g, '') || 'No description available for this position.'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {t('job_posted_on')} {formatDate(job.created, i18n)}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                                <a 
                                    href={job.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto text-center bg-[#1A1A1A] text-white hover:bg-[#333] px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded"
                                >
                                    {t('discover_view_original')} <ExternalLink className="h-4 w-4" />
                                </a>
                                <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide text-center w-full">{t('discover_external_listing')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalCount > 0 && (
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                    <span className="text-sm text-gray-500">
                        {t('discover_showing_page')} {page} {t('jobs_of')} {Math.ceil(totalCount / 10).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                        <Button 
                            onClick={handlePrevPage} 
                            disabled={page === 1}
                            variant="outline"
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        >
                            <ChevronLeft className="h-4 w-4" /> {t('pagination_prev')}
                        </Button>
                        <Button 
                            onClick={handleNextPage} 
                            disabled={(page * 10) >= totalCount}
                            variant="outline"
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        >
                            {t('pagination_next')} <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
