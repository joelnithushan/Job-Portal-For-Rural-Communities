import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { jobService } from '../../services/job.service';
import { DISTRICTS, CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from '../../utils/constants';

const postJobSchema = yup.object({
    title: yup.string().required('Job title is required').min(5, 'Title is too short'),
    description: yup.string().required('Description is required').min(20, 'Provide more details'),
    district: yup.string().required('District is required'),
    town: yup.string().required('Town is required'),
    category: yup.string().required('Category is required'),
    jobType: yup.string().required('Job type is required'),
    contactPhone: yup.string().required('Contact phone is required'),
    salaryMin: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
    salaryMax: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable(),
});

export const JobForm = ({ initialData, isEdit }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(postJobSchema),
        defaultValues: initialData || { jobType: 'FULL_TIME' }
    });

    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: data.title,
                description: data.description,
                district: data.district,
                town: data.town,
                category: data.category,
                jobType: data.jobType,
                contactPhone: data.contactPhone,
                ...(data.salaryMin && { salaryMin: data.salaryMin }),
                ...(data.salaryMax && { salaryMax: data.salaryMax }),
            };
            if (isEdit && initialData?._id) {
                await jobService.updateJob(initialData._id, payload);
                toast.success('Job updated successfully!');
            } else {
                await jobService.createJob(payload);
                toast.success('Job posted successfully!');
            }
            navigate('/employer/jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = (err) => `border border-gray-300 px-3 py-2.5 text-sm w-full focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white ${err ? 'border-red-400' : ''}`;

    const FieldWrap = ({ label, required, error, children, className = '' }) => (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {label} {required && <span className="text-[#8B1A1A]">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-[#8B1A1A] mt-0.5">{error}</p>}
        </div>
    );

    return (
        <div className="bg-white border border-gray-200 border-t-4 border-t-[#8B1A1A]">
            <div className="bg-[#FAF7F2] border-b border-gray-200 px-6 py-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#8B1A1A]">Job Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">All fields marked * are required</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrap label="Job Title" required error={errors.title?.message} className="md:col-span-2">
                    <input className={inputCls(errors.title)} placeholder="e.g. Senior Farm Supervisor" {...register('title')} />
                </FieldWrap>
                <FieldWrap label="District" required error={errors.district?.message}>
                    <select className={`${inputCls(errors.district)} cursor-pointer`} {...register('district')}>
                        <option value="">Select District</option>
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </FieldWrap>
                <FieldWrap label="Town" required error={errors.town?.message}>
                    <input className={inputCls(errors.town)} placeholder="e.g. Nallur" {...register('town')} />
                </FieldWrap>
                <FieldWrap label="Category" required error={errors.category?.message}>
                    <select className={`${inputCls(errors.category)} cursor-pointer`} {...register('category')}>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </FieldWrap>
                <FieldWrap label="Job Type" required error={errors.jobType?.message}>
                    <select className={`${inputCls(errors.jobType)} cursor-pointer`} {...register('jobType')}>
                        <option value="">Select Type</option>
                        {JOB_TYPES.filter(t => ['FULL_TIME', 'PART_TIME', 'CONTRACT'].includes(t)).map(t => (
                            <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
                        ))}
                    </select>
                </FieldWrap>
                <FieldWrap label="Contact Phone" required error={errors.contactPhone?.message}>
                    <input className={inputCls(errors.contactPhone)} placeholder="e.g. 077 123 4567" {...register('contactPhone')} />
                </FieldWrap>
                <FieldWrap label="Minimum Salary (LKR)">
                    <input type="number" className={inputCls()} placeholder="e.g. 35000" {...register('salaryMin')} />
                </FieldWrap>
                <FieldWrap label="Maximum Salary (LKR)">
                    <input type="number" className={inputCls()} placeholder="e.g. 55000" {...register('salaryMax')} />
                </FieldWrap>
                <p className="text-xs text-gray-400 md:col-span-2 -mt-3">Leave blank if salary is negotiable</p>
                <FieldWrap label="Job Description" required error={errors.description?.message} className="md:col-span-2">
                    <textarea className={`${inputCls(errors.description)} min-h-[120px] resize-y`} placeholder="Describe the role, responsibilities, and requirements..." {...register('description')} />
                </FieldWrap>
                <div className="md:col-span-2 border-t border-gray-200 pt-5 flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">* Required fields</span>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate('/employer/jobs')} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50">CANCEL</button>
                        <button type="submit" disabled={isSubmitting} className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50">
                            {isSubmitting ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'POST JOB'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
