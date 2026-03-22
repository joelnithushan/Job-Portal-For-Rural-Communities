import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Heart } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getInitials, formatSalary, timeAgo } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';

export const JobCard = ({ job, isSaved, onSaveToggle }) => {
    const typeColors = {
        FULL_TIME: 'border-l-blue-500',
        PART_TIME: 'border-l-amber-500',
        CONTRACT: 'border-l-purple-500',
        CASUAL: 'border-l-brand-terra',
    };

    const borderLeftColor = typeColors[job.type] || 'border-l-brand-green';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={`bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-brand-border/40 overflow-hidden flex flex-col md:flex-row p-5 md:items-center gap-6 relative border-l-4 ${borderLeftColor}`}
        >
            {/* Company Logo / Initials */}
            <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-cream border border-brand-border flex items-center justify-center overflow-hidden">
                    {job.companyId?.logoUrl ? (
                        <img src={job.companyId.logoUrl} alt={job.companyId.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-heading font-bold text-brand-green">
                            {getInitials(job.companyId?.name || 'Company')}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                    <Link to={`/jobs/${job._id}`} className="group min-w-0">
                        <h3 className="font-heading font-semibold text-xl text-brand-green group-hover:text-brand-terra transition-colors truncate">
                            {job.title}
                        </h3>
                    </Link>
                    <div className="flex-shrink-0">
                        {job.status === 'OPEN' && <Badge status="OPEN" size="sm" />}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-muted">
                    <span className="font-medium text-brand-dark truncate max-w-[200px]">
                        {job.companyId?.name}
                    </span>
                    <span className="hidden md:inline text-gray-300">•</span>

                    <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-brand-terra" />
                        <span>{job.district}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-brand-cream text-brand-dark rounded text-xs font-medium">
                            {job.category}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200">
                            {JOB_TYPE_LABELS[job.type] || job.type}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1 text-sm">
                    <div className="font-semibold text-amber-600">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-brand-muted">
                        <Clock size={12} />
                        <span>{timeAgo(job.createdAt)}</span>
                    </div>

                    {job.applicationsCount !== undefined && (
                        <div className="text-xs text-brand-muted ml-auto md:ml-0">
                            {job.applicationsCount} applicants
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:flex-col md:items-end md:justify-center flex-shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:ml-4">
                <Link to={`/jobs/${job._id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" size="sm" fullWidth>
                        View Job
                    </Button>
                </Link>

                {onSaveToggle && (
                    <button
                        onClick={() => onSaveToggle(job._id)}
                        className={`p-2 rounded-lg border transition-all ${isSaved
                                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                            }`}
                    >
                        <Heart size={18} className={isSaved ? "fill-current" : ""} />
                    </button>
                )}
            </div>

        </motion.div>
    );
};
