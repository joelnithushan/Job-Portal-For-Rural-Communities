import { useState, useEffect } from 'react';

export const useSavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('rw_saved_jobs') || '[]');
        setSavedJobs(stored);
    }, []);

    const toggleSaveJob = (jobId) => {
        setSavedJobs(prev => {
            const isSaved = prev.includes(jobId);
            const updated = isSaved 
                ? prev.filter(id => id !== jobId) 
                : [...prev, jobId];
                
            localStorage.setItem('rw_saved_jobs', JSON.stringify(updated));
            return updated;
        });
    };

    const isJobSaved = (jobId) => savedJobs.includes(jobId);

    return { savedJobs, toggleSaveJob, isJobSaved };
};
