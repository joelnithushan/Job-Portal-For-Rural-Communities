import { forwardRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

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
