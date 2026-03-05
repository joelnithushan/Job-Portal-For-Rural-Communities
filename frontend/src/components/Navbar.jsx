import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <span className="brand-icon">JC</span>
                <span className="brand-text">JobConnect</span>
            </Link>
            <div className="navbar-links">
                {user ? (
                    <>
                        <span className="navbar-greeting">Hi, {user.name}</span>
                        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
