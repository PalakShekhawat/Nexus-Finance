import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiTrendingUp, FiShield, FiPieChart, FiTarget } from 'react-icons/fi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-showcase">
                    <h2>Master Your<br />Finances</h2>
                    <p>Track your income, manage expenses, set budgets, and visualize your financial journey — all in one place.</p>
                    <ul className="auth-features">
                        <li>
                            <span className="feature-icon"><FiTrendingUp /></span>
                            Real-time financial analytics
                        </li>
                        <li>
                            <span className="feature-icon"><FiPieChart /></span>
                            Smart category tracking
                        </li>
                        <li>
                            <span className="feature-icon"><FiTarget /></span>
                            Budget goals & alerts
                        </li>
                        <li>
                            <span className="feature-icon"><FiShield /></span>
                            Bank-grade security
                        </li>
                    </ul>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">N</div>
                        <span className="auth-logo-text">Nexus Finance</span>
                    </div>

                    <h1 className="auth-heading">Welcome back</h1>
                    <p className="auth-subheading">Sign in to your account to continue</p>

                    {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label><FiMail className="me-2" />Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label><FiLock className="me-2" />Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button type="submit" className="btn-primary w-100 mb-3" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </Button>
                    </Form>

                    <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
