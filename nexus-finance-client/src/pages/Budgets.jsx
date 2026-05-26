import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Modal, Form, ProgressBar } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiTarget } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Insurance', 'Subscriptions', 'Travel', 'Personal Care', 'Other'];

export default function Budgets() {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const now = new Date();
    const [form, setForm] = useState({
        category: '',
        limit: '',
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });

    const fetchBudgets = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/budgets', {
                params: { month: now.getMonth() + 1, year: now.getFullYear() }
            });
            setBudgets(data.budgets);
        } catch (err) {
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const openAddModal = () => {
        setEditingBudget(null);
        setForm({ category: '', limit: '', month: now.getMonth() + 1, year: now.getFullYear() });
        setShowModal(true);
    };

    const openEditModal = (budget) => {
        setEditingBudget(budget);
        setForm({
            category: budget.category,
            limit: budget.limit.toString(),
            month: budget.month,
            year: budget.year
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, limit: parseFloat(form.limit) };
            if (editingBudget) {
                await api.put(`/budgets/${editingBudget._id}`, payload);
                toast.success('Budget updated!');
            } else {
                await api.post('/budgets', payload);
                toast.success('Budget created!');
            }
            setShowModal(false);
            fetchBudgets();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save budget');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget?')) return;
        try {
            await api.delete(`/budgets/${id}`);
            toast.success('Budget deleted');
            fetchBudgets();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const getProgressStatus = (percentage) => {
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return 'safe';
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.currency || 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const monthName = new Date(now.getFullYear(), now.getMonth()).toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center page-header">
                <div>
                    <h1 className="page-title">Budgets</h1>
                    <p className="page-subtitle">Track your spending limits for {monthName}</p>
                </div>
                <Button className="btn-primary d-flex align-items-center gap-2" onClick={openAddModal}>
                    <FiPlus /> Add Budget
                </Button>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-custom" />
                </div>
            ) : budgets.length > 0 ? (
                <Row className="g-3">
                    {budgets.map((budget, i) => {
                        const pct = Math.min(budget.percentage, 100);
                        const status = getProgressStatus(budget.percentage);

                        return (
                            <Col xs={12} md={6} xl={4} key={budget._id}>
                                <div className={`card budget-card fade-in-up delay-${Math.min(i + 1, 4)}`}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="stat-card-icon" style={{
                                                width: '42px', height: '42px',
                                                background: 'rgba(99, 102, 241, 0.12)',
                                                color: 'var(--accent-primary)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FiTarget />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{budget.category}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly Budget</div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <Button variant="link" size="sm" className="p-1" style={{ color: 'var(--accent-primary)' }} onClick={() => openEditModal(budget)}>
                                                <FiEdit2 size={14} />
                                            </Button>
                                            <Button variant="link" size="sm" className="p-1" style={{ color: 'var(--accent-danger)' }} onClick={() => handleDelete(budget._id)}>
                                                <FiTrash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                                        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatAmount(budget.spent)}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>of {formatAmount(budget.limit)}</span>
                                    </div>

                                    <div className="budget-progress-bar mb-2">
                                        <div
                                            className={`budget-progress-fill ${status}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem' }}>
                                        <span style={{
                                            color: status === 'danger' ? 'var(--accent-danger)' :
                                                status === 'warning' ? 'var(--accent-warning)' :
                                                    'var(--accent-success)',
                                            fontWeight: 600
                                        }}>
                                            {budget.percentage}% used
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {budget.remaining >= 0 ? `${formatAmount(budget.remaining)} left` : `${formatAmount(Math.abs(budget.remaining))} over`}
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <p className="empty-state-text">No budgets set for this month</p>
                        <Button className="btn-primary btn-sm" onClick={openAddModal}>Create Your First Budget</Button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {editingBudget ? 'Edit Budget' : 'Create Budget'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required disabled={!!editingBudget}>
                                <option value="">Select category...</option>
                                {EXPENSE_CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Budget Limit</Form.Label>
                            <Form.Control
                                type="number"
                                step="1"
                                min="1"
                                placeholder="1000"
                                value={form.limit}
                                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                            Cancel
                        </Button>
                        <Button type="submit" className="btn-primary">
                            {editingBudget ? 'Update' : 'Create'} Budget
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
