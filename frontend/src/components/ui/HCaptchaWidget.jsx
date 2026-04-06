import { forwardRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

/**
 * Reusable hCaptcha widget component.
 *
 * Props:
 *  - onVerify(token)  — called when user completes captcha
 *  - onExpire()       — called when token expires
 *  - error            — error message string to display below widget
 *
 * Ref:
 *  - parent can call ref.current.resetCaptcha() to reset on errors
 */
export const HCaptchaWidget = forwardRef(({ onVerify, onExpire, error }, ref) => {
    return (
        <div className="pt-1">
            <div className="flex justify-center">
                <HCaptcha
                    ref={ref}
                    sitekey={SITE_KEY}
                    onVerify={onVerify}
                    onExpire={onExpire}
                    onError={() => onExpire?.()}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
            )}
        </div>
    );
});

HCaptchaWidget.displayName = 'HCaptchaWidget';
