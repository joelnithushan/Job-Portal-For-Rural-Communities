import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useTranslation } from 'react-i18next';
import { parseSriLankanNIC } from '../../utils/nicValidation';

const nameRegex = /^[a-zA-Z\s.-]+$/;
const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const nicRegex = /^(?:\d{9}[vVxX]|\d{12})$/;


export const RegisterEmployerPage = () => {
    const { t } = useTranslation();

    const registerSchema = yup.object({
        name: yup.string().required(t('auth_err_name_req')).min(2, t('auth_err_name_short')).matches(nameRegex, t('auth_err_name_invalid')),
        email: yup.string().email(t('auth_err_email_invalid')).required(t('auth_err_email_req')),
        nic: yup.string().required('NIC is required').matches(nicRegex, 'Enter a valid Sri Lankan NIC').test(
            'nic-valid-date',
            'NIC contains an invalid date. Please check your NIC number.',
            (value) => {
                if (!value || !nicRegex.test(value)) return true;
                return parseSriLankanNIC(value) !== null;
            }
        ),
        gender: yup.string().required('Gender is required').oneOf(['MALE', 'FEMALE'], 'Invalid gender').test(
            'gender-matches-nic',
            'Gender does not match your NIC. Your NIC indicates a different gender.',
            function (value) {
                const { nic } = this.parent;
                if (!nic || !nicRegex.test(nic) || !value) return true;
                const nicInfo = parseSriLankanNIC(nic);
                if (!nicInfo) return true;
                return nicInfo.gender === value;
            }
        ),
        dob: yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future').test(
            'dob-matches-nic',
            'Date of birth does not match your NIC. Please verify your NIC and DOB.',
            function (value) {
                const { nic } = this.parent;
                if (!nic || !nicRegex.test(nic) || !value) return true;
                const nicInfo = parseSriLankanNIC(nic);
                if (!nicInfo) return true;
                const nicDate = new Date(nicInfo.dob);
                const inputDate = new Date(value);
                return nicDate.getUTCFullYear() === inputDate.getFullYear() &&
                       nicDate.getUTCMonth() === inputDate.getMonth() &&
                       nicDate.getUTCDate() === inputDate.getDate();
            }
        ),
        phone: yup.string().required(t('auth_err_phone_req')).matches(/^(?:\+94|0)[0-9]{9}$/, t('auth_err_phone_invalid')),
        password: yup.string().required(t('auth_err_pass_req')).matches(pwdRegex, t('auth_err_pass_invalid')),
        confirmPassword: yup.string()
            .required(t('auth_err_confirm_pass_req'))
            .oneOf([yup.ref('password')], t('auth_err_confirm_pass_match')),
        agreeToTerms: yup.boolean().oneOf([true], t('auth_err_terms_req'))
    });

    const { register: registerUser, googleLogin, sendOtp } = useAuth();
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [registrationData, setRegistrationData] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: { agreeToTerms: false }
    });

    const onGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential, 'EMPLOYER');
            toast.success(t('auth_emp_success_msg'));
            navigate('/employer', { replace: true });
        } catch (error) {
            console.error('Google Signup error:', error);
        }
    };

    const onSubmit = async (data) => {
        if (!executeRecaptcha) {
            toast.error(t('auth_security_err'));
            return;
        }

        setIsSubmitting(true);
        try {
            const captchaToken = await executeRecaptcha('register_employer');
            setRegistrationData({ ...data, captchaToken });
            await sendOtp(data.email, captchaToken);
            toast.success("OTP sent to your email!");
            setShowOtpModal(true);
        } catch (error) {
            console.error('OTP request error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setIsSubmitting(true);
        try {
            const { confirmPassword, agreeToTerms, captchaToken: oldToken, ...rest } = registrationData;
            const newCaptchaToken = await executeRecaptcha('register_emp_final');
            await registerUser({ ...rest, role: 'EMPLOYER', otp, captchaToken: newCaptchaToken });
            toast.success(t('auth_emp_success_msg'));
            setShowOtpModal(false);
            navigate('/employer', { replace: true });
        } catch (error) {
            console.error('Employer registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        setIsSubmitting(true);
        try {
            const captchaToken = await executeRecaptcha('resend_otp');
            await sendOtp(registrationData.email, captchaToken);
            toast.success("A new OTP has been sent to your email!");
        } catch (error) {
            console.error('OTP resend error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white border-2 border-brand-green/20 px-8 py-8 sm:px-10 sm:py-10 shadow-lg my-8 rounded-xl">
                <div className="text-center mb-6">
                    <Link to="/">
                        <img src="/logo.png" alt="NextEra" className="h-20 w-auto object-contain mx-auto mb-4" />
                    </Link>
                    <h2 className="text-xl font-heading font-semibold text-brand-dark">{t('auth_emp_title')}</h2>
                    <p className="text-sm text-gray-400 mt-1">{t('auth_emp_desc')}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label={t('auth_emp_name')}
                        placeholder={t('auth_emp_name_ph')}
                        error={errors.name?.message}
                        className="!mb-0"
                        {...register('name')}
                    />

                    <Input
                        label={t('auth_emp_email')}
                        type="email"
                        placeholder={t('auth_emp_email_ph')}
                        error={errors.email?.message}
                        className="!mb-0"
                        {...register('email')}
                    />

                    <Input
                        label="NIC Number"
                        placeholder="e.g. 199912345678 or 987654321V"
                        error={errors.nic?.message}
                        className="!mb-0"
                        {...register('nic')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-brand-dark">Gender</label>
                            <select 
                                className={`w-full px-4 py-2.5 bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-colors ${errors.gender ? 'border-red-400' : 'border-gray-200'}`}
                                {...register('gender')}
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                        </div>
                        <Input
                            label="Date of Birth"
                            type="date"
                            error={errors.dob?.message}
                            className="!mb-0"
                            {...register('dob')}
                        />
                    </div>

                    <Input
                        label={t('auth_phone')}
                        placeholder={t('auth_phone_ph')}
                        error={errors.phone?.message}
                        className="!mb-0"
                        {...register('phone')}
                    />

                    <Input
                        label={t('auth_password')}
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth_password_ph')}
                        error={errors.password?.message}
                        className="!mb-0"
                        rightElement={
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                        {...register('password')}
                    />

                    <Input
                        label={t('auth_confirm_password')}
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth_confirm_pwd_ph')}
                        error={errors.confirmPassword?.message}
                        className="!mb-0"
                        {...register('confirmPassword')}
                    />

                    <div className="pt-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('agreeToTerms')}
                                className={`mt-0.5 text-brand-green focus:ring-brand-green ${errors.agreeToTerms ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            <span className="text-sm text-gray-500">
                                {t('auth_agree')} <a href="#" className="text-brand-green hover:underline">{t('auth_terms')}</a> {t('auth_and')} <a href="#" className="text-brand-green hover:underline">{t('auth_privacy')}</a>
                            </span>
                        </label>
                        {errors.agreeToTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms.message}</p>}
                    </div>



                    <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                        {t('auth_emp_btn')}
                    </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{t('auth_or')}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex justify-center mb-4">
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => {
                            toast.error(t('auth_login_failed_msg'));
                        }}
                        text="signup_with"
                    />
                </div>

                <div className="text-center space-y-3">
                    <div className="text-sm text-gray-500">
                        {t('auth_emp_looking_job')}{' '}
                        <Link to="/register" className="font-semibold text-brand-green hover:underline">
                            {t('auth_reg_as_seeker')} →
                        </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                        {t('auth_already_have_acc')}{' '}
                        <Link to="/login" className="inline-flex items-center gap-1">
                            <span className="font-semibold text-white bg-brand-green px-3 py-1 text-xs hover:bg-brand-greenLight transition-colors">
                                {t('auth_login')}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white shadow-xl w-full max-w-sm p-6 relative animate-fade-in-up">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold font-heading text-brand-dark mb-2">Verify Email</h3>
                            <p className="text-sm text-gray-500">
                                We've sent a 6-digit code to <br />
                                <span className="font-semibold text-brand-dark">{registrationData?.email}</span>
                            </p>
                        </div>
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <Input
                                label="Enter OTP Code"
                                type="text"
                                placeholder="123456"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="text-center font-bold tracking-[0.5em] text-lg"
                                autoFocus
                            />
                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    fullWidth 
                                    onClick={() => setShowOtpModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    fullWidth 
                                    loading={isSubmitting}
                                >
                                    Verify
                                </Button>
                            </div>
                        </form>
                        <div className="mt-4 text-center">
                            <span className="text-sm text-gray-500">Didn't receive the code? </span>
                            <button 
                                type="button" 
                                onClick={handleResendOtp}
                                disabled={isSubmitting}
                                className="text-sm font-semibold text-brand-green hover:underline focus:outline-none disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
