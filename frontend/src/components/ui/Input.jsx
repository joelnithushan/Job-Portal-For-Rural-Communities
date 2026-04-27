import { forwardRef } from 'react';

export const Input = forwardRef(({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    rightElement,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex flex-col mb-4 w-full ${className}`}>
            {label && (
                <label htmlFor={inputId} className="mb-2 text-sm font-semibold text-brand-dark">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-2.5 bg-white border text-brand-dark font-body
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green/20
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-brand-green'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-brand-muted">
                        {rightIcon}
                    </div>
                )}

                {rightElement && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && <span className="mt-1.5 text-sm text-red-500 font-medium">{error}</span>}
            {hint && !error && <span className="mt-1.5 text-sm text-brand-muted">{hint}</span>}
        </div>
    );
});

Input.displayName = 'Input';
