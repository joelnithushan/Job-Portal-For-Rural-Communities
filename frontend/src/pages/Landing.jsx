import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="landing">
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">Sri Lanka Rural Communities</span>
                    <h1 className="hero-title">
                        Find Your Next
                        <span className="hero-highlight"> Opportunity</span>
                    </h1>
                    <p className="hero-subtitle">
                        Connecting rural job seekers with local employers across Sri Lanka.
                        Browse opportunities, apply instantly, and build your career — all in one platform.
                    </p>
                    <div className="hero-actions">
                        <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
                        <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card hero-card-1">
                        <div className="card-dot"></div>
                        <span>Farm Worker</span>
                        <small>Jaffna</small>
                    </div>
                    <div className="hero-card hero-card-2">
                        <div className="card-dot"></div>
                        <span>Web Developer</span>
                        <small>Kilinochchi</small>
                    </div>
                    <div className="hero-card hero-card-3">
                        <div className="card-dot"></div>
                        <span>Delivery Driver</span>
                        <small>Mullaitivu</small>
                    </div>
                </div>
            </section>

            <section className="features">
                <h2 className="features-title">How It Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-number">01</div>
                        <h3>Create Account</h3>
                        <p>Register as a Job Seeker or Employer in seconds.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-number">02</div>
                        <h3>Browse Jobs</h3>
                        <p>Search by district, category, or find jobs near you.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-number">03</div>
                        <h3>Apply Instantly</h3>
                        <p>One-click applications with real-time status tracking.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-number">04</div>
                        <h3>Get Hired</h3>
                        <p>Employers review and accept applications directly.</p>
                    </div>
                </div>
            </section>

            <section className="roles-section">
                <h2 className="features-title">Who Is This For?</h2>
                <div className="roles-grid">
                    <div className="role-card">
                        <div className="role-icon">JS</div>
                        <h3>Job Seekers</h3>
                        <p>Browse openings, apply to jobs, and track your application status.</p>
                    </div>
                    <div className="role-card">
                        <div className="role-icon">EM</div>
                        <h3>Employers</h3>
                        <p>Post jobs, manage your company profile, and review applicants.</p>
                    </div>
                    <div className="role-card">
                        <div className="role-icon">AD</div>
                        <h3>Admins</h3>
                        <p>Oversee the platform, verify companies, and manage users.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;
