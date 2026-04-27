import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CheckCircle, Mail } from 'lucide-react';
import { authAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';


export const ForgotPasswordPage = () => {
    const { t } = useTranslation();

    const schema = yup.object({
        email: yup.string().email(t('auth_err_email_invalid')).required(t('auth_err_email_req')),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await authAPI.forgotPassword({ email: data.email });
            setSentEmail(data.email);
            setEmailSent(true);
        } catch (error) {
            console.error('Forgot password error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">
            <div className="relative z-10 w-full max-w-md bg-white border border-gray-100 p-8 sm:p-10 shadow-xl rounded-xl">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/">
                        <img src="/logo.png" alt="NextEra" className="h-20 w-auto object-contain mx-auto mb-4" />
                    </Link>
                </div>

                {emailSent ? (
                    <div className="text-center py-4">
                        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
                        <h2 className="text-xl font-heading font-semibold text-brand-dark mb-3">{t('forgot_pwd_success_title')}</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            {t('forgot_pwd_success_desc_1')} <strong className="text-brand-dark">{sentEmail}</strong>, {t('forgot_pwd_success_desc_2')}
                        </p>
                        <Link to="/login">
                            <Button variant="outline" fullWidth>
                                {t('forgot_pwd_back_to_login')}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-heading font-semibold text-brand-dark mb-2">{t('forgot_pwd_title')}</h2>
                            <p className="text-sm text-gray-500">
                                {t('forgot_pwd_desc')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label={t('auth_email_address')}
                                type="email"
                                placeholder={t('auth_email_ph')}
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                                {isSubmitting ? t('forgot_pwd_sending') : t('forgot_pwd_send_link')}
                            </Button>
                        </form>
                    </>
                )}

                {/* Back to login */}
                {!emailSent && (
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

export default ForgotPasswordPage;
