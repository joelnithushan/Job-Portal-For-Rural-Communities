import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ label, value, icon: Icon, trend, color = 'green' }) => {
    const [count, setCount] = useState(0);

    // Animate count up
    useEffect(() => {
        if (typeof value !== 'number') return;

        let startTimestamp = null;
        const duration = 1500; // 1.5 seconds

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing out sine
            const easeProgress = Math.sin((progress * Math.PI) / 2);

            setCount(Math.floor(easeProgress * value));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    const colorVariants = {
        green: {
            border: 'border-t-brand-green',
            bg: 'bg-brand-green/10',
            text: 'text-brand-green'
        },
        terra: {
            border: 'border-t-brand-terra',
            bg: 'bg-brand-terra/10',
            text: 'text-brand-terra'
        },
        amber: {
            border: 'border-t-brand-amber',
            bg: 'bg-brand-amber/15',
            text: 'text-amber-700'
        },
        blue: {
            border: 'border-t-blue-500',
            bg: 'bg-blue-500/10',
            text: 'text-blue-600'
        }
    };

    const activeColor = colorVariants[color] || colorVariants.green;
    const displayValue = typeof value === 'number' ? count : value;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-t-4 ${activeColor.border} transition-shadow hover:shadow-md flex items-start justify-between`}
        >
            <div>
                <h4 className="text-sm font-semibold tracking-wider text-brand-muted uppercase mb-2">
                    {label}
                </h4>
                <div className="text-4xl font-heading font-semibold text-brand-dark leading-none">
                    {displayValue}
                </div>
                {trend && (
                    <div className="mt-2 text-sm text-brand-muted flex items-center gap-1">
                        {trend}
                    </div>
                )}
            </div>

            {Icon && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeColor.bg} ${activeColor.text}`}>
                    <Icon size={24} />
                </div>
            )}
        </motion.div>
    );
};
