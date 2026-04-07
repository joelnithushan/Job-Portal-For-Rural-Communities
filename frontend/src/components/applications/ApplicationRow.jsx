import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';
import { useTranslation } from 'react-i18next';

export const ApplicationRow = ({ application, index }) => {
    const { t, i18n } = useTranslation();
    const { job, status, createdAt } = application;
    const company = job?.companyId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ backgroundColor: 'rgba(245, 239, 224, 0.4)' }}
            className="flex flex-col md:flex-row md:items-center py-4 px-4 border-b border-gray-100 transition-colors last:border-0 hover:bg-brand-cream/40"
        >
            {/* Mobile-only status above title */}
            <div className="md:hidden mb-2">
                <Badge status={status} size="sm" />
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 pr-4">
                <Link to={`/jobs/${job?._id}`} className="block group">
                    <h4 className="font-heading font-semibold text-lg text-brand-green group-hover:text-brand-terra transition-colors truncate">
                        {job?.title || 'Unknown Job'}
                    </h4>
                </Link>
                <p className="text-sm font-medium text-brand-muted truncate">
                    {company?.name || 'Unknown Company'}
                </p>
            </div>

            {/* Metadata layout changes based on screen size */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-3 md:mt-0 md:ml-auto w-full md:w-auto">

                {/* District & Type */}
                <div className="flex items-center gap-3 w-1/2 md:w-32 flex-shrink-0">
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Location</span>
                        <span className="text-sm font-medium truncate">{job?.district}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-[40%] md:w-28 flex-shrink-0">
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Type</span>
                        <span className="text-sm font-medium truncate">{JOB_TYPE_LABELS[job?.type] || job?.type}</span>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 w-1/2 md:w-32 flex-shrink-0 mt-2 md:mt-0">
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Applied On</span>
                        <span className="text-sm font-medium">{formatDate(createdAt, i18n)}</span>
                    </div>
                </div>

                {/* Desktop Status */}
                <div className="hidden md:flex items-center justify-center w-32 flex-shrink-0">
                    <Badge status={status} />
                </div>

                {/* Action arrow */}
                <div className="ml-auto md:ml-4 flex items-center justify-end w-8 flex-shrink-0 mt-2 md:mt-0">
                    <Link
                        to={`/jobs/${job?._id}`}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-muted hover:text-brand-terra hover:border-brand-terra transition-colors shadow-sm"
                        aria-label="View Job Details"
                    >
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
