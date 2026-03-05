import { motion } from 'framer-motion';

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl ${className}`}
        >
            {Icon && (
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-brand-sand rounded-full text-brand-muted">
                    <Icon size={32} />
                </div>
            )}

            <h3 className="mb-2 text-xl font-heading font-semibold text-brand-dark">
                {title}
            </h3>

            <p className="max-w-sm mb-6 text-brand-muted">
                {description}
            </p>

            {action && (
                <div>
                    {action}
                </div>
            )}
        </motion.div>
    );
};
