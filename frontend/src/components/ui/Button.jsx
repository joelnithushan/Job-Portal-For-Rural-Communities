import { forwardRef } from 'react';
import { Spinner } from './Spinner';

export const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green/40';

    const sizeClasses = {
        sm: 'px-4 py-2 text-xs tracking-wider',
        md: 'px-6 py-3 text-sm tracking-wider',
        lg: 'px-10 py-4 text-sm tracking-wider',
    };

    const variantClasses = {
        primary: 'bg-brand-green text-white border border-brand-green hover:bg-brand-greenLight',
        secondary: 'bg-brand-amber text-brand-dark border border-brand-amber hover:brightness-110',
        outline: 'bg-transparent border border-current hover:bg-white/10',
        ghost: 'bg-transparent text-brand-dark hover:bg-gray-100 border border-transparent',
        danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
    };

    const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${className}`}
            {...props}
        >
            {loading && <Spinner size="sm" className="mr-2 text-current" />}
            {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';
