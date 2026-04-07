import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';


export const LoginPage = () => {
    const { t } = useTranslation();

    const loginSchema = yup.object({
        email: yup.string().email(t('auth_err_email_invalid')).required(t('auth_err_email_req')),
        password: yup.string().required(t('auth_err_pass_req')),
    });

    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const onGoogleSuccess = async (credentialResponse) => {
        try {
            const user = await googleLogin(credentialResponse.credential);
            const from = location.state?.from?.pathname ||
                (user.role === 'EMPLOYER' ? '/employer' :
                    user.role === 'ADMIN' ? '/admin' : '/dashboard');
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Google Login error:', error);
        }
    };

    const onSubmit = async (data) => {
        if (!executeRecaptcha) {
            toast.error(t('auth_security_err'));
            return;
        }

        setIsSubmitting(true);
        try {
            const captchaToken = await executeRecaptcha('login');
            const user = await login({ ...data, captchaToken });
            const from = location.state?.from?.pathname ||
                (user.role === 'EMPLOYER' ? '/employer' :
                    user.role === 'ADMIN' ? '/admin' : '/dashboard');
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white border-2 border-brand-green/20 p-8 sm:p-10 shadow-lg rounded-2xl">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/">
                        <img src="/logo.png" alt="NextEra" className="h-20 w-auto object-contain mx-auto mb-4" />
                    </Link>
                    <h2 className="text-xl font-heading font-semibold text-brand-dark">{t('auth_login_title')}</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label={t('auth_email_address')}
                        type="email"
                        placeholder={t('auth_email_ph')}
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <div className="relative">
                        <Input
                            label={t('auth_password')}
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth_password_ph')}
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="text-brand-green focus:ring-brand-green" />
                            <span className="text-sm text-gray-600">{t('auth_remember_me')}</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm font-medium text-brand-green hover:underline">
                            {t('auth_forgot_password')}
                        </Link>
                    </div>



                    <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                        {t('auth_login_btn')}
                    </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{t('auth_or')}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Social Login */}
                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => {
                            toast.error(t('auth_login_failed_msg'));
                        }}
                    />
                </div>

                <div className="text-center text-sm text-gray-500">
                    {t('auth_no_account')}{' '}
                    <Link to="/register" className="inline-flex items-center gap-1">
                        <span className="font-semibold text-white bg-brand-green px-3 py-1 text-xs hover:bg-brand-greenLight transition-colors">
                            {t('auth_signup_link')}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
