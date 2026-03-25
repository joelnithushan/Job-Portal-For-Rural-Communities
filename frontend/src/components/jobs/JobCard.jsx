import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Bookmark, Building2, Briefcase } from 'lucide-react';
import { formatSalary, timeAgo } from '../../utils/formatters';
import { JOB_TYPE_LABELS } from '../../utils/constants';

export const JobCard = ({ job, isSaved, onSaveToggle }) => {
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on the save button
        if (e.target.closest('.save-btn')) return;
        navigate(`/jobs/${job._id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group cursor-pointer bg-white border border-gray-200 hover:border-[#8B1A1A] hover:shadow-md transition-all duration-200 flex flex-col p-4 relative border-l-4 border-l-[#8B1A1A] rounded-none"
        >
            {/* Header: Title and Save Action */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-4">
                    <h3 className="font-bold text-lg text-[#8B1A1A] group-hover:text-[#6e1515] transition-colors line-clamp-1 uppercase tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {job.title}
                    </h3>
                    <div className="flex items-center text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        <Building2 size={13} className="mr-1.5 text-[#E2B325]" />
                        {job.employerId?.name || job.employerId?.businessName || 'Confidential Company'}
                    </div>
                </div>

                <div className="flex-shrink-0 flex gap-2">
                    {job.status === 'OPEN' && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-none text-[10px] uppercase font-bold border border-green-200 tracking-wider h-fit mt-1">
                            OPEN
                        </span>
                    )}
                    
                    {onSaveToggle && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveToggle(job._id);
                            }}
                            className={`save-btn p-1.5 rounded-none text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ${
                                isSaved ? 'text-red-500' : ''
                            }`}
                        >
                            <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
                        </button>
                    )}
                </div>
            </div>

            {/* Inline Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-600 mt-2 mb-3">
                <div className="flex items-center gap-1.5 font-medium">
                    <MapPin size={14} className="text-[#8B0000]" />
                    <span>{job.district}</span>
                </div>
                
                <div className="flex items-center gap-1.5 font-medium">
                    <Briefcase size={14} className="text-[#8B0000]" />
                    <span>{JOB_TYPE_LABELS[job.jobType] || job.jobType || job.type}</span>
                </div>
                
                <div className="flex items-center gap-1.5 font-bold text-[#DAB82D]">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
                
                <div className="flex items-center gap-1.5 font-medium ml-auto">
                    <Clock size={14} className="text-gray-400" />
                    <span>{timeAgo(job.createdAt)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="px-2 py-1 bg-[#8B0000]/5 text-[#8B0000] rounded-none text-[11px] font-bold border border-[#8B0000]/10 uppercase tracking-widest">
                    {job.category || 'General'}
                </span>
                
                <span className="text-[12px] font-bold text-[#DAB82D] group-hover:text-[#8B0000] transition-colors flex items-center gap-1 uppercase tracking-wider">
                    View Details &rarr;
                </span>
            </div>
        </div>
    );
};
