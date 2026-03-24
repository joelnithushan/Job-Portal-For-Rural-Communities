import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { JobForm } from '../../components/Jobs/JobForm';
import toast from 'react-hot-toast';

const PageHeader = ({ title, subtitle, rightSlot }) => (
    <div className="bg-[#8B1A1A] px-8 py-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
    </div>
);

export const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await jobService.getJobById(id);
                setJob(res.data?.job || res.data);
            } catch (error) {
                toast.error('Failed to load job details');
                navigate('/employer/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    if (loading) return null;

    return (
        <>
            <PageHeader
                title="Edit Job"
                subtitle="Update the details of your job posting"
                rightSlot={<button onClick={() => navigate('/employer/jobs')} className="text-white/70 hover:text-white text-sm uppercase tracking-wider">← MY JOBS</button>}
            />
            {job && <JobForm initialData={job} isEdit={true} />}
        </>
    );
};
