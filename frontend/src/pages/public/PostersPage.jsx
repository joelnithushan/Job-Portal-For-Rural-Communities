import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { postersAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { DISTRICTS, CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from '../../utils/constants';

export const PostersPage = () => {
    const { t } = useTranslation();
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        district: '',
        category: '',
        jobType: '',
        page: 1,
        limit: 12,
    });

    const fetchPosters = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.district) params.district = filters.district;
            if (filters.category) params.category = filters.category;
            if (filters.jobType) params.jobType = filters.jobType;
            params.page = filters.page;
            params.limit = filters.limit;
            const res = await postersAPI.getPublic(params);
            const data = res.data || {};
            setPosters(data.posters || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (e) {
            setPosters([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosters();
    }, [filters]);

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clear = () => setFilters({ search: '', district: '', category: '', jobType: '', page: 1, limit: 12 });

    return (
        <div className="min-h-screen bg-[#FAF7F2] pt-4 pb-12 md:pt-6">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="bg-white border border-gray-200 mb-6 overflow-hidden">
                    <div className="bg-[#8B1A1A] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-[#E2B325]" />
                            <h2 className="text-white text-sm font-bold uppercase tracking-widest">
                                {t('posters_page_title', { defaultValue: 'AI Job Posters' })} ({total})
                            </h2>
                        </div>
                        <p className="text-[10px] text-[#E2B325] font-bold uppercase tracking-widest">
                            {t('posters_page_subtitle', { defaultValue: 'Visual job ads designed by AI' })}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-2 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                placeholder={t('search_jobs', { defaultValue: 'Search posters...' })}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#8B1A1A]"
                            />
                        </div>
                        <select
                            value={filters.district}
                            onChange={(e) => handleChange('district', e.target.value)}
                            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white"
                        >
                            <option value="">{t('all_districts', { defaultValue: 'All Districts' })}</option>
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            value={filters.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white"
                        >
                            <option value="">{t('all_categories', { defaultValue: 'All Categories' })}</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={filters.jobType}
                            onChange={(e) => handleChange('jobType', e.target.value)}
                            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white"
                        >
                            <option value="">{t('all_types', { defaultValue: 'All Types' })}</option>
                            {JOB_TYPES.filter(j => j !== 'CASUAL').map(j => (
                                <option key={j} value={j}>{JOB_TYPE_LABELS[j]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white border border-gray-200 animate-pulse" />
                        ))}
                    </div>
                ) : posters.length === 0 ? (
                    <EmptyState
                        icon={ImageOff}
                        title={t('posters_empty_title', { defaultValue: 'No posters found' })}
                        description={t('posters_empty_desc', { defaultValue: 'Try clearing your filters or come back later for new poster ads.' })}
                        action={<Button variant="outline" onClick={clear}>{t('jobs_clear_filters', { defaultValue: 'Clear filters' })}</Button>}
                    />
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    >
                        {posters.map(p => (
                            <motion.div
                                key={p._id}
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <Link
                                    to={`/posters/${p._id}`}
                                    className="group block bg-white border border-gray-200 hover:border-[#8B1A1A] transition-colors overflow-hidden"
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
                                        <img
                                            src={p.imageUrl}
                                            alt={p.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{p.title}</h3>
                                        <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                                            <MapPin size={11} />
                                            <span className="truncate">{[p.town, p.district].filter(Boolean).join(', ') || '-'}</span>
                                        </div>
                                        {p.description && (
                                            <p className="mt-2 text-[11px] text-gray-600 line-clamp-2 leading-snug">
                                                {p.description}
                                            </p>
                                        )}
                                        {p.jobType && (
                                            <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest bg-[#E2B325]/20 text-[#8B1A1A] px-2 py-0.5">
                                                {JOB_TYPE_LABELS[p.jobType] || p.jobType}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page === 1}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            {t('pagination_prev', { defaultValue: 'Prev' })}
                        </Button>
                        <span className="px-4 py-2 text-sm text-gray-600">
                            {filters.page} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page >= totalPages}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            {t('pagination_next', { defaultValue: 'Next' })}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PosterDetailPage = () => {
    const { t } = useTranslation();
    const id = window.location.pathname.split('/').pop();
    const [poster, setPoster] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await postersAPI.getById(id);
                if (alive) setPoster(res.data?.poster || null);
            } catch {
                if (alive) setPoster(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-gray-500">Loading...</div>;
    }
    if (!poster) {
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
                <EmptyState
                    icon={ImageOff}
                    title={t('poster_not_found', { defaultValue: 'Poster not found' })}
                    description=""
                    action={<Link to="/posters"><Button>{t('back_to_posters', { defaultValue: 'Back to posters' })}</Button></Link>}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7F2] py-8">
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-3">
                    <img src={poster.imageUrl} alt={poster.title} className="w-full h-auto" />
                </div>
                <div className="bg-white border border-gray-200 p-5">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">{poster.title}</h1>
                    <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                        <MapPin size={14} />
                        {[poster.town, poster.district].filter(Boolean).join(', ') || '-'}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {poster.jobType && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E2B325]/20 text-[#8B1A1A] px-2 py-1">
                                {JOB_TYPE_LABELS[poster.jobType] || poster.jobType}
                            </span>
                        )}
                        {poster.category && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#8B1A1A]/10 text-[#8B1A1A] px-2 py-1">
                                {poster.category}
                            </span>
                        )}
                    </div>
                    {(poster.salaryMin || poster.salaryMax) && (
                        <p className="text-sm text-[#8B1A1A] font-semibold mb-3">
                            LKR {poster.salaryMin?.toLocaleString() || '-'} - {poster.salaryMax?.toLocaleString() || '-'}
                        </p>
                    )}
                    <p className="text-sm text-[#1A1A1A] whitespace-pre-line mb-4">{poster.description}</p>
                    {poster.contactPhone && (
                        <p className="text-sm text-gray-600">
                            <strong>{t('contact', { defaultValue: 'Contact' })}: </strong>{poster.contactPhone}
                        </p>
                    )}
                    <div className="mt-6">
                        <Link to="/posters">
                            <Button variant="outline">{t('back_to_posters', { defaultValue: 'Back to posters' })}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
