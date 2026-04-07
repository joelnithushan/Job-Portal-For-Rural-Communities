import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

// Schema moved inside component

export const ResetPasswordPage = () => {
    const { t } = useTranslation();

    const schema = yup.object({
        password: yup.string().required(t('auth_err_pass_req')).matches(pwdRegex, t('auth_err_pass_invalid')),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password'), null], t('auth_err_confirm_pass_match'))
            .required(t('auth_err_confirm_pass_req')),
    });

    const { token } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await authAPI.resetPassword(token, { password: data.password });
            toast.success(t('auth_reset_success'));
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            if (error.response?.status === 400) {
                setTokenExpired(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-xl">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/">
                        <img src="/logo.png" alt="NextEra" className="h-20 w-auto object-contain mx-auto mb-4" />
                    </Link>
                </div>

                {tokenExpired ? (
                    /* ─── Expired Token State ─── */
                    <div className="text-center py-4">
                        <XCircle size={48} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
                        <h2 className="text-xl font-heading font-semibold text-brand-dark mb-3">{t('reset_expired_title')}</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            {t('reset_expired_desc')}
                        </p>
                        <Link to="/forgot-password">
                            <Button variant="primary" fullWidth>
                                {t('reset_req_new_link')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* ─── Form State ─── */
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-heading font-semibold text-brand-dark mb-2">{t('reset_title')}</h2>
                            <p className="text-sm text-gray-500">{t('reset_desc')}</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="relative">
                                <Input
                                    label={t('auth_new_password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
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

                            <div className="relative">
                                <Input
                                    label={t('auth_confirm_password')}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                                {isSubmitting ? t('reset_resetting') : t('reset_btn')}
                            </Button>
                        </form>
                    </>
                )}

                {/* Back to login */}
                {!tokenExpired && (
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-brand-dark transition-colors">
                            ← {t('forgot_pwd_back_link')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
