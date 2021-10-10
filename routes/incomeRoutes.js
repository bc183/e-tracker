const express = require('express');
const Income = require('../models/Income');
const auth = require('../middlewares/auth');


const router = express.Router();

const addIncome = async (req, res) => {
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
        //save Income
        const user = res.locals.user;
        const IncomeObj = new Income({
            category: category.toLowerCase(),
            amount,
            description,
            date,
            _userId: user._id,
            createdAt: new Date()
        });

        const savedIncome = await IncomeObj.save();
        return res.status(201).json(savedIncome);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
}

const updateIncome = async (req, res) => {
    const { category, amount, description, date } = req.body;
    const incomeId = req.params.incomeId;
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
        //update Income
        let income = await Income.findOne({ _id: incomeId });
        if (!income) {
            return res.status(400).json({ error: "Income with id not found" });
        }
        if (!user._id.equals(income._userId)) {
            return res.status(403).json({ message: "You are not the owner of this Income" });
        }
        const updatedResponse = await Income.updateOne({ _id: incomeId }, {
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

const deleteIncome = async (req, res) => {
    const incomeId = req.params.incomeId;
    const user = res.locals.user;
    try {
        const income = await Income.findOne({ _id: incomeId });
        if (!income) {
            return res.status(400).json({ error: "Income with id not found" });
        }
        if (!user._id.equals(income._userId)) {
            return res.status(403).json({ message: "You are not the owner of this Income" });
        }
        await Income.deleteOne({ _id: incomeId });
        return res.status(200).json({ message: "Deleted Successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}

const getAllIncomes = async (req, res) => {
    const user = res.locals.user;
    try {
        const allIncomes = await Income.find({ _userId: user._id });
        let totalIncome = allIncomes.length === 0 ? 0 : allIncomes
                                                            .map(Income => Income.amount)
                                                            .reduce((prev, idx) => prev + idx);
        return res.status(200).json({ total: totalIncome, incomes: allIncomes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." });
    }
}

router.post("/", auth, addIncome);
router.get("/", auth, getAllIncomes);
router.put("/:incomeId", auth, updateIncome);
router.delete("/:incomeId", auth, deleteIncome);

module.exports = router;
