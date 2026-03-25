import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-[#1A1A1A] text-white/60 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <img src="/logo.png" alt="RuralWork" className="h-20 w-auto object-contain brightness-0 invert mb-4" />
                        <p className="text-sm leading-relaxed max-w-sm">
                            Connecting skilled rural workers with verified local employers across Sri Lanka.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white text-xs tracking-widest uppercase font-semibold mb-4">For Job Seekers</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xs tracking-widest uppercase font-semibold mb-4">For Employers</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link to="/register" className="hover:text-white transition-colors">Post a Job</Link></li>
                            <li><Link to="/companies" className="hover:text-white transition-colors">Employer Directory</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                    <p>&copy; {new Date().getFullYear()} NextEra</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
