import { useState, useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { FiTrendingUp, FiTrendingDown, FiPercent, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/transactions/stats');
                setStats(data.stats);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-custom" />
            </div>
        );
    }

    const { currentMonth, categoryBreakdown, trend, recentTransactions } = stats || {
        currentMonth: { income: 0, expenses: 0, balance: 0, savingsRate: 0 },
        categoryBreakdown: [],
        trend: [],
        recentTransactions: []
    };

    // Line chart config
    const lineData = {
        labels: trend.map(t => t.month),
        datasets: [
            {
                label: 'Income',
                data: trend.map(t => t.income),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                borderWidth: 2
            },
            {
                label: 'Expenses',
                data: trend.map(t => t.expense),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ef4444',
                borderWidth: 2
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#94a3b8', usePointStyle: true, padding: 20, font: { size: 12 } }
            },
            tooltip: {
                backgroundColor: '#1a1f35',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'INR', maximumFractionDigits: 0 }).format(ctx.parsed.y)}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(99, 102, 241, 0.06)' },
                ticks: { color: '#64748b', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(99, 102, 241, 0.06)' },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    callback: (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'INR', maximumFractionDigits: 0 }).format(v)
                }
            }
        }
    };

    // Doughnut chart config
    const categoryColors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
        '#f97316', '#eab308', '#22c55e', '#06b6d4',
        '#3b82f6', '#a855f7'
    ];

    const doughnutData = {
        labels: categoryBreakdown.map(c => c._id),
        datasets: [{
            data: categoryBreakdown.map(c => c.total),
            backgroundColor: categoryColors.slice(0, categoryBreakdown.length),
            borderWidth: 0,
            hoverOffset: 8
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', usePointStyle: true, padding: 14, font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: '#1a1f35',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'INR', maximumFractionDigits: 0 }).format(ctx.parsed)}`
                }
            }
        },
        cutout: '70%'
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.currency || 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div>
            {/* Theme Toggle */}
            <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="page-header">
                <h1 className="page-title fade-in-up" style={{ color: 'var(--text-primary)' }}>
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
                </h1>
                <p className="page-subtitle fade-in-up delay-1" style={{ color: 'var(--text-secondary)' }}>
                    Here's your financial overview for this month
                </p>
            </div>

            {/* Summary Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} xl={3}>
                    <div className="card stat-card income fade-in-up delay-1">
                        <div className="stat-card-icon"><FiTrendingUp /></div>
                        <div className="stat-card-label">Total Income</div>
                        <div className="stat-card-value">{formatAmount(currentMonth.income)}</div>
                    </div>
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <div className="card stat-card expense fade-in-up delay-2">
                        <div className="stat-card-icon"><FiTrendingDown /></div>
                        <div className="stat-card-label">Total Expenses</div>
                        <div className="stat-card-value">{formatAmount(currentMonth.expenses)}</div>
                    </div>
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <div className="card stat-card balance fade-in-up delay-3">
                        <div className="stat-card-icon"><MdCurrencyRupee /></div>
                        <div className="stat-card-label">Balance</div>
                        <div className="stat-card-value">{formatAmount(currentMonth.balance)}</div>
                    </div>
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <div className="card stat-card savings fade-in-up delay-4">
                        <div className="stat-card-icon"><FiPercent /></div>
                        <div className="stat-card-label">Savings Rate</div>
                        <div className="stat-card-value">{currentMonth.savingsRate}%</div>
                    </div>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="g-3 mb-4">
                <Col lg={8}>
                    <div className="chart-container fade-in-up delay-2">
                        <h3 className="chart-title">Income vs Expenses Trend</h3>
                        <div style={{ height: '320px' }}>
                            {trend.length > 0 ? (
                                <Line data={lineData} options={lineOptions} />
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📊</div>
                                    <p className="empty-state-text">Add transactions to see your trend</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="chart-container fade-in-up delay-3">
                        <h3 className="chart-title">Expense Breakdown</h3>
                        <div style={{ height: '320px' }}>
                            {categoryBreakdown.length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🍩</div>
                                    <p className="empty-state-text">No expenses this month</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Recent Transactions */}
            <div className="chart-container fade-in-up delay-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="chart-title mb-0">Recent Transactions</h3>
                    <Link to="/transactions" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>

                {recentTransactions.length > 0 ? (
                    <div>
                        {recentTransactions.map((tx) => (
                            <div key={tx._id} className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`transaction-icon ${tx.type}`}>
                                        {tx.type === 'income' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description || tx.category}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {tx.category} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'
                                }}>
                                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <p className="empty-state-text">No transactions yet. Add one to get started!</p>
                        <Link to="/transactions" className="btn btn-primary btn-sm">Add Transaction</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
