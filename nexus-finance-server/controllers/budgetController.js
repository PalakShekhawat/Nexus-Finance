const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for user (current month)
// @route   GET /api/budgets
exports.getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = parseInt(month) || (now.getMonth() + 1);
        const targetYear = parseInt(year) || now.getFullYear();

        const budgets = await Budget.find({
            user: req.user.id,
            month: targetMonth,
            year: targetYear
        });

        // Calculate spending for each budget category
        const monthStart = new Date(targetYear, targetMonth - 1, 1);
        const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const spending = await Transaction.aggregate([
            {
                $match: {
                    user: Transaction.base.Types.ObjectId.createFromHexString(req.user.id),
                    type: 'expense',
                    date: { $gte: monthStart, $lte: monthEnd }
                }
            },
            {
                $group: {
                    _id: '$category',
                    spent: { $sum: '$amount' }
                }
            }
        ]);

        const budgetsWithSpending = budgets.map(budget => {
            const categorySpending = spending.find(s => s._id === budget.category);
            const spent = categorySpending?.spent || 0;
            return {
                ...budget.toObject(),
                spent,
                remaining: budget.limit - spent,
                percentage: Math.round((spent / budget.limit) * 100)
            };
        });

        res.json({ success: true, budgets: budgetsWithSpending });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch budgets', error: error.message });
    }
};

// @desc    Create a budget
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
    try {
        const { category, limit, period, month, year } = req.body;
        const now = new Date();

        const budget = await Budget.create({
            user: req.user.id,
            category,
            limit,
            period: period || 'monthly',
            month: month || (now.getMonth() + 1),
            year: year || now.getFullYear()
        });

        res.status(201).json({ success: true, budget });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A budget for this category already exists for the selected month'
            });
        }
        res.status(400).json({ success: false, message: 'Failed to create budget', error: error.message });
    }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        res.json({ success: true, budget });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update budget', error: error.message });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        res.json({ success: true, message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete budget', error: error.message });
    }
};
