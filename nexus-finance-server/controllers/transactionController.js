const Transaction = require('../models/Transaction');

// @desc    Get all transactions for user
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate, sort = '-date', limit = 50, page = 1 } = req.query;

        const filter = { user: req.user.id };
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(filter)
        ]);

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
    }
};

// @desc    Create a transaction
// @route   POST /api/transactions
exports.createTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date } = req.body;
        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            category,
            amount,
            description,
            date: date || new Date()
        });

        res.status(201).json({ success: true, transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create transaction', error: error.message });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, transaction });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update transaction', error: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete transaction', error: error.message });
    }
};

// @desc    Get transaction statistics / analytics
// @route   GET /api/transactions/stats
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Current month range
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        // Monthly totals
        const monthlyTotals = await Transaction.aggregate([
            {
                $match: {
                    user: Transaction.base.Types.ObjectId.createFromHexString(userId),
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const income = monthlyTotals.find(t => t._id === 'income')?.total || 0;
        const expenses = monthlyTotals.find(t => t._id === 'expense')?.total || 0;

        // Category breakdown for current month
        const categoryBreakdown = await Transaction.aggregate([
            {
                $match: {
                    user: Transaction.base.Types.ObjectId.createFromHexString(userId),
                    type: 'expense',
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Last 6 months trend
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        const trend = await Transaction.aggregate([
            {
                $match: {
                    user: Transaction.base.Types.ObjectId.createFromHexString(userId),
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Format trend data
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const monthName = d.toLocaleString('default', { month: 'short' });

            const incomeData = trend.find(t => t._id.month === m && t._id.year === y && t._id.type === 'income');
            const expenseData = trend.find(t => t._id.month === m && t._id.year === y && t._id.type === 'expense');

            months.push({
                month: monthName,
                year: y,
                income: incomeData?.total || 0,
                expense: expenseData?.total || 0
            });
        }

        // Recent transactions
        const recentTransactions = await Transaction.find({ user: userId })
            .sort('-date')
            .limit(5);

        res.json({
            success: true,
            stats: {
                currentMonth: {
                    income,
                    expenses,
                    balance: income - expenses,
                    savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
                },
                categoryBreakdown,
                trend: months,
                recentTransactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
    }
};
