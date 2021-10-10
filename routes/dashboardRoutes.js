const express = require('express');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middlewares/auth');

const router = express.Router();

const getDashboardData = async (req, res) => {
    const { from, to } = req.query;
    let query = {}

    if (from && to) {
        query.date = {
            $gte: from,
            $lt: to
        };
    }
    const user = res.locals.user;
    query._userId = user._id;
    //find incomes based on these dates
    try {
        const incomes = await Income.find(query);
        const totalIncome = incomes.length === 0 ? 0 : incomes
                                                        .map(income => income.amount)
                                                        .reduce((prev, index) => prev + index);
        // find expenses between these two dates so that we can calculate the balance. if these two dates are not passed, then calc for all time.
        const expenses = await Expense.find(query);
        let totalExpense = expenses.length === 0 ? 0 : expenses
                                                        .map(expense => expense.amount)
                                                        .reduce((prev, idx) => prev + idx);
        let allExpenseCategories = expenses.map(expense => expense.category); 
        let allIncomeCategories = incomes.map(income => income.category);
        let balance = totalIncome - totalExpense;
        const response = {
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            expenses: expenses,
            incomes: incomes,
            expenseCategories: [ ...new Set(allExpenseCategories)],
            incomeCategories: [...new Set(allIncomeCategories)],
            balance: balance
        }
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

router.get('/', auth, getDashboardData);

module.exports = router;