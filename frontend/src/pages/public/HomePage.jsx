import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Briefcase, Users, MapPin, ArrowRight,
    Leaf, HardHat, Heart, BookOpen, ShoppingBag, Truck, Coffee, Fish
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const MOCK_FEATURED_JOBS = [
    { id: 1, title: 'Farm Supervisor', company: 'Green Valley Estates', location: 'Nuwara Eliya', type: 'Full Time', salary: 'LKR 45,000 – 60,000' },
    { id: 2, title: 'Construction Foreman', company: 'BuildRight Pvt Ltd', location: 'Galle', type: 'Contract', salary: 'LKR 3,500 / day' },
    { id: 3, title: 'Retail Assistant', company: 'Saman Stores', location: 'Kandy', type: 'Part Time', salary: 'LKR 25,000 – 35,000' },
    { id: 4, title: 'Delivery Driver', company: 'Express Cargo', location: 'Kurunegala', type: 'Full Time', salary: 'LKR 40,000 – 50,000' },
];

const CATEGORIES = [
    { name: 'Agriculture', icon: Leaf, count: 124 },
    { name: 'Construction', icon: HardHat, count: 85 },
    { name: 'Healthcare', icon: Heart, count: 42 },
    { name: 'Education', icon: BookOpen, count: 67 },
    { name: 'Retail', icon: ShoppingBag, count: 110 },
    { name: 'Transport', icon: Truck, count: 93 },
    { name: 'Hospitality', icon: Coffee, count: 56 },
    { name: 'Fishing', icon: Fish, count: 28 },
];

export const HomePage = () => {
    const [activeTab, setActiveTab] = useState('seeker');

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="flex flex-col min-h-screen">

            {/* ── HERO ── */}
            <section className="relative w-full overflow-hidden" style={{ aspectRatio: '16/6' }}>
                <img
                    src="/hero-bg.png"
                    alt="RuralWork - Find Work. Build Community."
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay Buttons */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4">
                    <Link to="/jobs">
                        <button className="px-10 py-3.5 bg-white text-brand-dark text-xs tracking-[0.2em] font-medium border border-white hover:bg-gray-100 transition-colors">
                            EXPLORE JOBS
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="px-10 py-3.5 bg-transparent text-white text-xs tracking-[0.2em] font-medium border border-white hover:bg-white hover:text-brand-dark transition-colors">
                            POST A JOB
                        </button>
                    </Link>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-brand-green py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: '2,400+', label: 'Jobs Posted' },
                            { value: '580+', label: 'Verified Employers' },
                            { value: '24', label: 'Districts' },
                            { value: '89%', label: 'Placement Rate' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <span className="block text-3xl lg:text-4xl font-heading text-white mb-1">{stat.value}</span>
                                <span className="text-white/60 text-xs tracking-widest uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES ── */}
            <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-heading mb-3">Explore by Category</h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-sm">Find opportunities that match your skills across Sri Lanka's key industries.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {CATEGORIES.map((cat, i) => (
                            <Link
                                key={i}
                                to={`/jobs?category=${cat.name}`}
                                className="group flex items-center justify-between px-6 py-5 border border-gray-100 hover:bg-brand-green hover:text-white transition-colors"
                            >
                                <div>
                                    <h3 className="text-sm font-semibold text-brand-dark group-hover:text-white transition-colors">{cat.name}</h3>
                                    <p className="text-xs text-gray-400 group-hover:text-white/60 transition-colors mt-0.5">{cat.count} open positions</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-20 bg-brand-sand">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-heading mb-3">How It Works</h2>
                    </div>

                    <div className="flex justify-center mb-10">
                        <div className="inline-flex border border-gray-300 divide-x divide-gray-300">
                            <button
                                onClick={() => setActiveTab('seeker')}
                                className={`px-6 py-3 text-xs tracking-widest font-medium transition-colors ${activeTab === 'seeker' ? 'bg-brand-green text-white' : 'bg-white text-gray-500 hover:text-brand-dark'}`}
                            >
                                FOR JOB SEEKERS
                            </button>
                            <button
                                onClick={() => setActiveTab('employer')}
                                className={`px-6 py-3 text-xs tracking-widest font-medium transition-colors ${activeTab === 'employer' ? 'bg-brand-green text-white' : 'bg-white text-gray-500 hover:text-brand-dark'}`}
                            >
                                FOR EMPLOYERS
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {(activeTab === 'seeker' ? [
                            { title: 'Create Free Account', desc: 'Register in under 2 minutes with basic details.' },
                            { title: 'Search Nearby Jobs', desc: 'Filter by district, category, or use GPS location.' },
                            { title: 'Apply Instantly', desc: 'One-click apply to jobs with your saved profile.' }
                        ] : [
                            { title: 'Register Company', desc: 'Submit your business details for admin verification.' },
                            { title: 'Post Job Openings', desc: 'Reach thousands of verified local workers easily.' },
                            { title: 'Review Applicants', desc: 'Shortlist, reject, or accept candidates with one click.' }
                        ]).map((step, i) => (
                            <div key={i} className="bg-white p-8 border border-gray-200">
                                <span className="inline-block text-xs tracking-widest text-brand-amber font-semibold mb-4">STEP {i + 1}</span>
                                <h3 className="text-lg font-heading font-semibold mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED JOBS ── */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-end justify-between mb-10">
                        <h2 className="text-3xl font-heading">Latest Opportunities</h2>
                        <Link to="/jobs" className="hidden md:flex items-center gap-2 text-xs tracking-widest text-brand-green font-semibold hover:text-brand-greenLight transition-colors">
                            VIEW ALL <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
                        {MOCK_FEATURED_JOBS.map((job) => (
                            <div key={job.id} className="bg-white p-6 flex flex-col">
                                <div className="w-10 h-10 bg-brand-sand flex items-center justify-center font-heading text-sm font-semibold text-brand-green mb-5">
                                    {job.company.charAt(0)}
                                </div>
                                <h3 className="font-semibold text-brand-dark mb-1">{job.title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{job.company}</p>
                                <div className="flex flex-wrap gap-2 mb-5 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                                    <span>·</span>
                                    <span>{job.type}</span>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-sm font-semibold text-brand-dark">{job.salary}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/jobs">
                            <Button variant="primary">BROWSE ALL JOBS</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── EMPLOYER CTA ── */}
            <section className="bg-brand-green py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-heading text-white mb-5">
                        Hire from Your Community
                    </h2>
                    <p className="text-white/60 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                        Post job openings, manage applications, and connect with verified local talent. Supporting the rural workforce.
                    </p>
                    <Link to="/register">
                        <Button variant="secondary" size="lg">
                            START HIRING TODAY
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};
