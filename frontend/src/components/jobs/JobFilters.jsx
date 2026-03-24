import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DISTRICTS, CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from '../../utils/constants';
import { useGeolocation } from '../../hooks/useGeolocation';

export const JobFilters = ({ filters, onFilterChange, onClear, isLoading }) => {
    const { coords, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

    // Local state for debounced inputs
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [localMin, setLocalMin] = useState(filters.salaryMin || '');
    const [localMax, setLocalMax] = useState(filters.salaryMax || '');

    // Handle Search Input (could add debounce here)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilterChange({ search: localSearch });
    };

    const handleSalarySubmit = () => {
        onFilterChange({
            salaryMin: localMin ? Number(localMin) : null,
            salaryMax: localMax ? Number(localMax) : null
        });
    };

    useEffect(() => {
        if (coords && filters.nearMe && !filters.coords) {
            onFilterChange({ coords });
        }
    }, [coords, filters.nearMe]);

    useEffect(() => {
        if (geoError && filters.nearMe) {
            toast.error(`Location error: ${geoError}`);
            onFilterChange({ nearMe: false, coords: null });
        }
    }, [geoError]);

    const handleNearMeToggle = () => {
        const willEnable = !filters.nearMe;

        if (willEnable) {
            if (coords) {
                onFilterChange({ nearMe: true, radius: filters.radius || 5, coords });
            } else {
                getLocation();
                onFilterChange({ nearMe: true, radius: filters.radius || 5 });
            }
        } else {
            onFilterChange({ nearMe: false, coords: null });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border/40 p-5 md:p-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-lg flex items-center gap-2 text-brand-green">
                    <SlidersHorizontal size={20} className="text-brand-terra" />
                    Filter Jobs
                </h2>

                {/* Count of active filters if any */}
                {(filters.district || filters.category || filters.type || filters.nearMe) && (
                    <button
                        onClick={onClear}
                        className="text-sm font-medium text-brand-terra hover:underline"
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {/* Search */}
                <form onSubmit={handleSearchSubmit}>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Search</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-muted">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Title or keyword..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra/50 focus:border-brand-terra transition-colors"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onBlur={handleSearchSubmit}
                        />
                    </div>
                </form>

                <hr className="border-gray-100" />

                {/* Location / Near Me */}
                <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Location</label>

                    <div className="mb-4">
                        <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-full ${filters.nearMe ? 'bg-brand-terra/10 text-brand-terra' : 'bg-gray-100 text-gray-500'}`}>
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm font-medium text-brand-dark">Jobs Near Me</span>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.nearMe ? 'bg-brand-terra' : 'bg-gray-200'}`}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={filters.nearMe || false}
                                    onChange={handleNearMeToggle}
                                />
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.nearMe ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>

                        {filters.nearMe && (
                            <div className="mt-3 px-2">
                                <p className="text-xs text-brand-muted mb-2">
                                    {geoLoading ? 'Getting location...' : coords ? 'Using exact location' : 'Waiting for permission...'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Radius:</span>
                                    <select
                                        className="text-sm border-0 bg-transparent text-brand-terra font-semibold focus:ring-0 cursor-pointer p-0"
                                        value={filters.radius || 5}
                                        onChange={(e) => onFilterChange({ radius: Number(e.target.value) })}
                                    >
                                        <option value="5">5 km</option>
                                        <option value="10">10 km</option>
                                        <option value="25">25 km</option>
                                        <option value="50">50 km</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {!filters.nearMe && (
                        <Select
                            className="mb-0"
                            value={filters.district || ''}
                            onChange={(e) => onFilterChange({ district: e.target.value || null })}
                            options={[
                                { value: '', label: 'All Districts' },
                                ...DISTRICTS.map(d => ({ value: d, label: d }))
                            ]}
                        />
                    )}
                </div>

                <hr className="border-gray-100" />

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Category</label>
                    <Select
                        className="mb-0"
                        value={filters.category || ''}
                        onChange={(e) => onFilterChange({ category: e.target.value || null })}
                        options={[
                            { value: '', label: 'Any Category' },
                            ...CATEGORIES.map(c => ({ value: c, label: c }))
                        ]}
                    />
                </div>

                {/* Job Type */}
                <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-3">Job Type</label>
                    <div className="flex flex-col gap-2.5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="type"
                                value=""
                                checked={!filters.type}
                                onChange={() => onFilterChange({ type: null })}
                                className="w-4 h-4 text-brand-terra border-gray-300 focus:ring-brand-terra focus:ring-2"
                            />
                            <span className="text-sm text-brand-dark group-hover:text-brand-terra transition-colors">All Types</span>
                        </label>

                        {JOB_TYPES.map(type => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="type"
                                    value={type}
                                    checked={filters.type === type}
                                    onChange={(e) => onFilterChange({ type: e.target.value })}
                                    className="w-4 h-4 text-brand-terra border-gray-300 focus:ring-brand-terra focus:ring-2"
                                />
                                <span className="text-sm text-brand-dark group-hover:text-brand-terra transition-colors">
                                    {JOB_TYPE_LABELS[type]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Salary */}
                <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Expected Salary (Monthly)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min LKR"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra/50 focus:border-brand-terra transition-colors"
                            value={localMin}
                            onChange={(e) => setLocalMin(e.target.value)}
                            onBlur={handleSalarySubmit}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max LKR"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra/50 focus:border-brand-terra transition-colors"
                            value={localMax}
                            onChange={(e) => setLocalMax(e.target.value)}
                            onBlur={handleSalarySubmit}
                        />
                    </div>
                </div>

                {/* Apply Button (Mobile mostly, desktop auto-applies via onBlur/onChange) */}
                <div className="pt-2 md:hidden">
                    <Button variant="primary" fullWidth loading={isLoading} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        View Results
                    </Button>
                </div>
            </div>
        </div>
    );
};
