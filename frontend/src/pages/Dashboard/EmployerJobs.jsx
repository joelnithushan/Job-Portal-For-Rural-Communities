import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/job.service';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const map = {
        OPEN: 'bg-[#E2B325] text-[#8B1A1A]',
        CLOSED: 'bg-gray-200 text-gray-600',
        FULL_TIME: 'bg-[#1e40af] text-white',
        PART_TIME: 'bg-[#E2B325] text-[#8B1A1A]',
        CONTRACT: 'bg-[#6e1515] text-white',
    };
    return (
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-200 text-gray-600'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
};

const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
        <p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p>
    </div>
);

const EmptyState = ({ message, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="h-12 w-12 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-300 text-2xl">—</span>
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-2">
            {message || 'No Records Found'}
        </p>
        <p className="text-xs text-gray-300">{subtitle}</p>
    </div>
);

const SectionCard = ({ children, className = '', title, rightSlot }) => (
    <div className={`bg-white border border-gray-200 overflow-hidden mb-6 ${className}`}>
        {title && (
            <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                <h2 className="text-white text-sm font-bold uppercase tracking-widest">{title}</h2>
                {rightSlot && <span>{rightSlot}</span>}
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

const PageHeader = ({ title, subtitle, rightSlot }) => (
    <div className="bg-[#8B1A1A] px-8 py-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {rightSlot && <div>{rightSlot}</div>}
    </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, loading, confirmText = 'DELETE' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-[#1A1A1A]/70 z-50 flex items-center justify-center">
            <div className="bg-white border-t-4 border-t-[#8B1A1A] p-6 max-w-sm w-full mx-4">
                <h3 className="font-['Playfair_Display'] text-lg text-[#1A1A1A] font-bold">{title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
                <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={onCancel} className="border border-gray-300 px-4 py-2 text-sm uppercase tracking-wider text-gray-600 hover:bg-gray-50">CANCEL</button>
                    <button onClick={onConfirm} disabled={loading} className="bg-[#8B1A1A] text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-[#6e1515] disabled:opacity-50">
                        {loading ? 'WAIT...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const EmployerJobs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchJobs = async () => {
        try {
            const res = await jobService.getJobs({ limit: 100 });
            const allJobs = res.data?.jobs || res.data || [];
            setJobs(allJobs.filter(j => (j.employerId?._id || j.employerId) === user?._id));
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [user]);

    const handleDelete = async (id) => {
        setDeleteLoading(true);
        try {
            await jobService.deleteJob(id);
            setJobs(prev => prev.filter(j => j._id !== id));
            toast.success('Job deleted');
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (id) => {
        navigate(`/employer/jobs/edit/${id}`);
    };

    const filtered = jobs.filter(j => {
        const matchSearch = !searchTerm || j.title?.toLowerCase().includes(searchTerm.toLowerCase()) || j.district?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCount = jobs.filter(j => j.status === 'OPEN').length;
    const closedCount = jobs.filter(j => j.status === 'CLOSED').length;

    if (loading) return <Spinner />;

    return (
        <>
            <PageHeader
                title="My Jobs"
                subtitle="Manage all your job postings"
                rightSlot={
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 border border-white/20 px-4 py-2 text-white text-xs uppercase tracking-wider">
                            Active: <span className="text-[#E2B325] font-bold">{openCount}</span> | Closed: <span className="text-[#E2B325] font-bold">{closedCount}</span>
                        </div>
                        <button onClick={() => navigate('/employer/post-job')} className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-[#d4a420]">POST NEW JOB</button>
                    </div>
                }
            />

            <div className="bg-white border border-gray-200 border-t-4 border-t-[#E2B325] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Search by title or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white cursor-pointer">
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                </select>
                <div className="ml-auto text-xs text-gray-400 uppercase tracking-wider border-l border-gray-200 pl-4">
                    Showing {filtered.length} of {jobs.length}
                </div>
            </div>

            <SectionCard className="!p-0" title="ALL JOBS" rightSlot={<span className="bg-[#E2B325] text-[#8B1A1A] text-xs font-bold px-2 py-0.5">{filtered.length}</span>}>
                {filtered.length === 0 ? <EmptyState message="No jobs found" subtitle="Try adjusting your search or filters, or post a new job." /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#8B1A1A]">
                                    {['#', 'JOB', 'LOCATION', 'TYPE', 'SALARY', 'STATUS', 'ACTIONS'].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-xs font-bold text-white uppercase tracking-widest whitespace-nowrap ${i < 6 ? 'border-r border-[#6e1515]' : ''} ${h === 'ACTIONS' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((job, i) => (
                                    <tr key={job._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/50'} hover:bg-[#FAF7F2] ${i === filtered.length - 1 ? 'border-b-2 border-[#8B1A1A]' : ''}`}>
                                        <td className="py-3 px-4 text-xs text-gray-400 font-mono border-b border-gray-100">{i + 1}</td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-[#1A1A1A]">{job.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{job.category}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 border-b border-gray-100">{job.district}{job.town ? `, ${job.town}` : ''}</td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={job.jobType} /></td>
                                        <td className="py-3 px-4 border-b border-gray-100">
                                            {job.salaryMin || job.salaryMax ? (
                                                <span className="text-sm font-semibold text-[#8B1A1A]">Rs. {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()}</span>
                                            ) : <span className="text-xs text-gray-300">Negotiable</span>}
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-100"><StatusBadge status={job.status} /></td>
                                        <td className="py-3 px-4 text-right border-b border-gray-100">
                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                <button onClick={() => navigate(`/employer/jobs/${job._id}/applications`)} className="text-xs px-2.5 py-1 uppercase tracking-wider bg-[#8B1A1A] text-white hover:bg-[#6e1515]">APPLICATIONS</button>
                                                <button onClick={() => handleEdit(job._id)} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-gray-400 text-gray-500 hover:bg-gray-50">EDIT</button>
                                                <button onClick={() => setDeleteTarget(job)} className="text-xs px-2.5 py-1 uppercase tracking-wider border border-red-400 text-red-500 hover:bg-red-50">DELETE</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <div className="bg-[#8B1A1A] px-5 py-2.5 flex gap-6">
                <span className="text-white/70 text-xs uppercase tracking-wider">Total <span className="text-[#E2B325] font-bold ml-1">{jobs.length}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Open <span className="text-[#E2B325] font-bold ml-1">{openCount}</span></span>
                <span className="text-white/70 text-xs uppercase tracking-wider">Closed <span className="text-[#E2B325] font-bold ml-1">{closedCount}</span></span>
            </div>

            <ConfirmModal isOpen={!!deleteTarget} title="Delete Job" message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                onConfirm={() => handleDelete(deleteTarget?._id)} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        </>
    );
};
