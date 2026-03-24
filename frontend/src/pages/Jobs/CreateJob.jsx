import { useNavigate } from 'react-router-dom';
import { JobForm } from '../../components/Jobs/JobForm';

const PageHeader = ({ title, subtitle, rightSlot }) => (
    <div className="bg-[#8B1A1A] px-8 py-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
    </div>
);

export const CreateJob = () => {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader
                title="Post a New Job"
                subtitle="Fill in the details to attract the right candidates"
                rightSlot={<button onClick={() => navigate('/employer/jobs')} className="text-white/70 hover:text-white text-sm uppercase tracking-wider">← MY JOBS</button>}
            />
            <JobForm />
        </>
    );
};
