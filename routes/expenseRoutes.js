const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middlewares/auth');


const router = express.Router();

const addExpense = async (req, res) => {
    const { category, amount, description, date } = req.body;
    let errors = {}
    //validation
    if (category?.trim().length === 0) {
        errors.category = "Category cannot be null";
    }
    if (amount?.toString().trim().length === 0 || amount === 0) {
        errors.amount = "amount cannot be null";
    }
    if (description?.trim().length === 0) {
        errors.description = "description cannot be null";
    }
    if (date?.trim().length === 0) {
        errors.date = "date cannot be null";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    try {
        //save expense
        const user = res.locals.user;
        const expenseObj = new Expense({
            category: category.toLowerCase(),
            amount,
            description,
            date,
            _userId: user._id,
            createdAt: new Date()
        });

        const savedExpense = await expenseObj.save();
        return res.status(201).json(savedExpense);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const updateExpense = async (req, res) => {
    const { category, amount, description, date } = req.body;
    const expenseId = req.params.expenseId;
    let errors = {}
    //validation
    if (category?.trim().length === 0) {
        errors.category = "Category cannot be null";
    }
    if (amount?.toString().trim().length === 0) {
        errors.amount = "amount cannot be null";
    }
    if (description?.trim().length === 0) {
        errors.description = "description cannot be null";
    }
    if (date?.trim().length === 0) {
        errors.date = "date cannot be null";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    const user = res.locals.user;

    try {
        //udpate expense
        let expense = await Expense.findOne({ _id: expenseId });
        if (!expense) {
            return res.status(400).json({ error: "Expense with that id not found" });
        }
        if (!user._id.equals(expense._userId)) {
            return res.status(403).json({ message: "You are not the owner of this expense" });
        }
        const updatedResponse = await Expense.updateOne({ _id: expenseId }, {
            amount: amount,
            description: description,
            date: date,
            category: category.toLowerCase()
        });
        return res.status(201).json(updatedResponse);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const deleteExpense = async (req, res) => {
    const expenseId = req.params.expenseId;
    const user = res.locals.user;
    try {
        const expense = await Expense.findOne({ _id: expenseId });
        if (!expense) {
            return res.status(400).json({ error: "Expense with that id not found" });
        }
        if (!user._id.equals(expense._userId)) {
            return res.status(403).json({ message: "You are not the owner of this expense" });
        }
        await Expense.deleteOne({ _id: expenseId });
        return res.status(200).json({ message: "Deleted Successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}

const getAllExpenses = async (req, res) => {
    const user = res.locals.user;
    try {
        const allExpenses = await Expense.find({ _userId: user._id });
        let totalExpense = allExpenses.length === 0 ? 0 : allExpenses
                                                            .map(expense => expense.amount)
                                                            .reduce((prev, idx) => prev + idx);
        return res.status(200).json({ total: totalExpense, expenses: allExpenses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}

router.post("/", auth, addExpense);
router.get("/", auth, getAllExpenses);
router.put("/:expenseId", auth, updateExpense);
router.delete("/:expenseId", auth, deleteExpense);

module.exports = router;
