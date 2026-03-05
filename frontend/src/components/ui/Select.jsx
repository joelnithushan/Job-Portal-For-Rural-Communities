import { forwardRef } from 'react';

export const Select = forwardRef(({
    label,
    error,
    hint,
    options = [],
    className = '',
    id,
    ...props
}, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex flex-col mb-4 w-full ${className}`}>
            {label && (
                <label htmlFor={selectId} className="mb-2 text-sm font-semibold text-brand-dark">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            w-full px-4 py-2.5 bg-white border rounded-xl text-brand-dark font-body appearance-none
            transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-brand-terra/20
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-brand-terra'}
          `}
                    {...props}
                >
                    {options.map((opt, index) => (
                        <option key={index} value={opt.value !== undefined ? opt.value : opt}>
                            {opt.label || opt}
                        </option>
                    ))}
                </select>

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-brand-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            {error && <span className="mt-1.5 text-sm text-red-500 font-medium">{error}</span>}
            {hint && !error && <span className="mt-1.5 text-sm text-brand-muted">{hint}</span>}
        </div>
    );
});

Select.displayName = 'Select';
