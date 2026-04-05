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

const nameRegex = /^[a-zA-Z\s.-]+$/;
const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const nicRegex = /^(?:\d{9}[vVxX]|\d{12})$/;

const registerSchema = yup.object({
    name: yup.string().required('Full name is required').min(2, 'Name is too short').matches(nameRegex, 'Name can only contain letters, spaces, dots and hyphens'),
    email: yup.string().email('Please enter a valid email address').required('Email is required'),
    nic: yup.string().required('National ID is required').matches(nicRegex, 'Enter a valid Sri Lankan NIC'),
    phone: yup.string().required('Phone number is required').matches(/^(?:\+94|0)[0-9]{9}$/, 'Enter a valid Sri Lankan phone number'),
    password: yup.string().required('Password is required').matches(pwdRegex, 'Password must have min 8 chars, 1 uppercase, 1 number, and 1 special char'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
    agreeToTerms: yup.boolean().oneOf([true], 'You must accept the terms')
});

export const RegisterPage = () => {
    const { register: registerUser, googleLogin } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: { agreeToTerms: false }
    });

    const onGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential, 'JOB_SEEKER');
            toast.success('Account created successfully!');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Google Signup error:', error);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const { confirmPassword, agreeToTerms, ...rest } = data;
            await registerUser({ ...rest, role: 'JOB_SEEKER' });
            toast.success('Account created successfully!');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white border-2 border-brand-green/20 p-8 sm:p-10 shadow-lg rounded-2xl my-8">
                <div className="text-center mb-6">
                    <Link to="/">
                        <img src="/logo.png" alt="RuralWork" className="h-20 w-auto object-contain mx-auto mb-4" />
                    </Link>
                    <h2 className="text-xl font-heading font-semibold text-brand-dark">Job Seeker Sign Up</h2>
                    <p className="text-sm text-gray-400 mt-1">Find jobs near your hometown</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Nimal Perera"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="nimal@gmail.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <Input
                        label="National ID (NIC)"
                        placeholder="e.g. 199912345678 or 987654321V"
                        error={errors.nic?.message}
                        {...register('nic')}
                    />

                    <Input
                        label="Phone Number"
                        placeholder="e.g. 0712345678 or +94712345678"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimum 8 characters"
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

                    <Input
                        label="Confirm Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        error={errors.confirmPassword?.message}
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
                                I agree to the <a href="#" className="text-brand-green hover:underline">Terms</a> and <a href="#" className="text-brand-green hover:underline">Privacy Policy</a>
                            </span>
                        </label>
                        {errors.agreeToTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms.message}</p>}
                    </div>

                    <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                        CREATE ACCOUNT
                    </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => {
                            toast.error('Google Signup Failed');
                        }}
                        text="signup_with"
                    />
                </div>

                <div className="text-center space-y-3">
                    <div className="text-sm text-gray-500">
                        Are you an employer?{' '}
                        <Link to="/register/employer" className="font-semibold text-brand-green hover:underline">
                            Register as Employer →
                        </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="inline-flex items-center gap-1">
                            <span className="font-semibold text-white bg-brand-green px-3 py-1 text-xs hover:bg-brand-greenLight transition-colors">
                                Log in
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
