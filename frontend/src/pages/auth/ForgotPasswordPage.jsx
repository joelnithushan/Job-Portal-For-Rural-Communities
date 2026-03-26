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

const schema = yup.object({
    email: yup.string().email('Please enter a valid email address').required('Email is required'),
});

export const ForgotPasswordPage = () => {
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
            toast.error(error.response?.data?.message || 'Something went wrong');
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

                {emailSent ? (
                    /* ─── Success State ─── */
                    <div className="text-center py-4">
                        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
                        <h2 className="text-xl font-heading font-semibold text-brand-dark mb-3">Check Your Email</h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            If an account exists for <strong className="text-brand-dark">{sentEmail}</strong>, you will receive a password reset link shortly. Check your spam folder too.
                        </p>
                        <Link to="/login">
                            <Button variant="outline" fullWidth>
                                BACK TO LOGIN
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* ─── Form State ─── */
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-heading font-semibold text-brand-dark mb-2">Forgot Password</h2>
                            <p className="text-sm text-gray-500">
                                Enter your registered email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                                {isSubmitting ? 'SENDING...' : 'SEND RESET LINK'}
                            </Button>
                        </form>
                    </>
                )}

                {/* Back to login */}
                {!emailSent && (
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-brand-dark transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
