import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Table, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUpRight, FiArrowDownRight, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Other Income'],
    expense: ['Food', 'Transport', 'Housing', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Insurance', 'Subscriptions', 'Travel', 'Personal Care', 'Other']
};

export default function Transactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [filter, setFilter] = useState({ type: '', category: '' });

    const [form, setForm] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter.type) params.type = filter.type;
            if (filter.category) params.category = filter.category;
            const { data } = await api.get('/transactions', { params });
            setTransactions(data.transactions);
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const openAddModal = () => {
        setEditingTx(null);
        setForm({ type: 'expense', category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const openEditModal = (tx) => {
        setEditingTx(tx);
        setForm({
            type: tx.type,
            category: tx.category,
            amount: tx.amount.toString(),
            description: tx.description,
            date: new Date(tx.date).toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, amount: parseFloat(form.amount) };
            if (editingTx) {
                await api.put(`/transactions/${editingTx._id}`, payload);
                toast.success('Transaction updated!');
            } else {
                await api.post('/transactions', payload);
                toast.success('Transaction added!');
            }
            setShowModal(false);
            fetchTransactions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save transaction');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Transaction deleted');
            fetchTransactions();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: user?.currency || 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Manage your income and expenses</p>
                </div>
                <Button className="btn-primary d-flex align-items-center gap-2" onClick={openAddModal}>
                    <FiPlus /> Add Transaction
                </Button>
            </div>

            {/* Filters */}
            <div className="card p-3 mb-4">
                <Row className="g-3 align-items-center">
                    <Col xs={12} sm={4} md={3}>
                        <div className="d-flex align-items-center gap-2">
                            <FiFilter style={{ color: 'var(--text-muted)' }} />
                            <Form.Select size="sm" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </Form.Select>
                        </div>
                    </Col>
                    <Col xs={12} sm={4} md={3}>
                        <Form.Select size="sm" value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                            <option value="">All Categories</option>
                            {[...CATEGORIES.income, ...CATEGORIES.expense].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-custom" />
                    </div>
                ) : transactions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <Table hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th style={{ width: '100px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx._id} className="transaction-row">
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`transaction-icon ${tx.type}`}>
                                                    {tx.type === 'income' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description || tx.category}</div>
                                                    <Badge bg={tx.type === 'income' ? 'success' : 'danger'} style={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                                        {tx.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{tx.category}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'
                                            }}>
                                                {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button variant="link" size="sm" className="p-1" style={{ color: 'var(--accent-primary)' }} onClick={() => openEditModal(tx)}>
                                                    <FiEdit2 size={15} />
                                                </Button>
                                                <Button variant="link" size="sm" className="p-1" style={{ color: 'var(--accent-danger)' }} onClick={() => handleDelete(tx._id)}>
                                                    <FiTrash2 size={15} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <p className="empty-state-text">No transactions found</p>
                        <Button className="btn-primary btn-sm" onClick={openAddModal}>Add Your First Transaction</Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {editingTx ? 'Edit Transaction' : 'Add Transaction'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                                <option value="">Select category...</option>
                                {CATEGORIES[form.type].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="What was this for?"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                            Cancel
                        </Button>
                        <Button type="submit" className="btn-primary">
                            {editingTx ? 'Update' : 'Add'} Transaction
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
