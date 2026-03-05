import { motion } from 'framer-motion';

export const JobCardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border/40 overflow-hidden flex flex-col md:flex-row p-5 md:items-center gap-6 relative">
            {/* Avatar Skeleton */}
            <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 md:w-1/2" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="hidden md:inline text-gray-200">•</div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />

                    <div className="flex gap-2">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center gap-3 md:flex-col md:items-end md:justify-center flex-shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:ml-4">
                <div className="h-9 bg-gray-200 rounded-xl animate-pulse w-full md:w-28" />
            </div>
        </div>
    );
};
