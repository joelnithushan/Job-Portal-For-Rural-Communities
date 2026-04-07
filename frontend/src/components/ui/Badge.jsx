export const Badge = ({ status, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
    };

    const statusColors = {
        APPLIED: 'bg-blue-100 text-blue-700',
        REVIEWED: 'bg-amber-100 text-amber-700',
        SHORTLISTED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-600',
        ACCEPTED: 'bg-brand-green text-white',
        OPEN: 'bg-green-100 text-green-700',
        CLOSED: 'bg-gray-100 text-gray-500',
        DRAFT: 'bg-yellow-100 text-yellow-700',
        PENDING: 'bg-amber-100 text-amber-700',
        VERIFIED: 'bg-green-100 text-green-700',
        DEFAULT: 'bg-gray-100 text-gray-700'
    };

    const normalizedStatus = (status || '').toUpperCase();
    const colorClasses = statusColors[normalizedStatus] || statusColors.DEFAULT;

    return (
        <span className={`inline-flex items-center rounded-full font-medium uppercase tracking-wider ${sizeClasses[size]} ${colorClasses} ${className}`}>
            {status}
        </span>
    );
};
