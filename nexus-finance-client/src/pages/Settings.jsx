import { useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FiUser, FiMail, FiDollarSign, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
];

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        currency: user?.currency || 'INR'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', form);
            updateUser(data.user);
            toast.success('Settings saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const currentCurrency = CURRENCIES.find(c => c.code === form.currency);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account preferences</p>
            </div>

            <Row>
                <Col lg={8} xl={6}>
                    <Card className="p-4">
                        <Form onSubmit={handleSubmit}>
                            {/* Profile Section */}
                            <h5 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                                Profile
                            </h5>

                            <Form.Group className="mb-3">
                                <Form.Label><FiUser className="me-2" />Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label><FiMail className="me-2" />Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                                <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    Email cannot be changed
                                </Form.Text>
                            </Form.Group>

                            {/* Currency Section */}
                            <h5 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                                <FiDollarSign className="me-2" />Currency
                            </h5>

                            <Form.Group className="mb-3">
                                <Form.Label>Preferred Currency</Form.Label>
                                <Form.Select
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.symbol} {c.name} ({c.code})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    This will be used to display all monetary values across the dashboard
                                </Form.Text>
                            </Form.Group>

                            {currentCurrency && (
                                <div className="card p-3 mb-4" style={{ background: 'rgba(99, 102, 241, 0.06)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preview</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: currentCurrency.code
                                        }).format(12345.67)}
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="btn-primary d-flex align-items-center gap-2" disabled={saving}>
                                <FiSave />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
