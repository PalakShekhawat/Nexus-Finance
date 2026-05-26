import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiCreditCard, FiTarget, FiLogOut, FiMenu, FiSettings } from 'react-icons/fi';
import { useState } from 'react';

const navItems = [
    { path: '/', icon: <FiGrid />, label: 'Dashboard' },
    { path: '/transactions', icon: <FiCreditCard />, label: 'Transactions' },
    { path: '/budgets', icon: <FiTarget />, label: 'Budgets' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' }
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="btn d-md-none position-fixed"
                style={{
                    top: '16px', left: '16px', zIndex: 1100,
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', borderRadius: '10px', padding: '8px 12px'
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <FiMenu size={20} />
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="d-md-none position-fixed"
                    style={{ inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <a href="/" className="sidebar-brand" style={{ textDecoration: 'none' }}>
                    <div className="sidebar-brand-icon">N</div>
                    <span className="sidebar-brand-name sidebar-text">Nexus Finance</span>
                </a>

                <nav>
                    <ul className="sidebar-nav">
                        {navItems.map(item => (
                            <li key={item.path} className="sidebar-nav-item">
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="sidebar-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={logout} title="Logout">
                        <div className="sidebar-user-avatar">{initials}</div>
                        <div className="sidebar-text">
                            <div className="sidebar-user-name">{user?.name || 'User'}</div>
                            <div className="sidebar-user-email">{user?.email || ''}</div>
                        </div>
                        <FiLogOut style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                </div>
            </aside>
        </>
    );
}
