const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: String
    },
    amount: {
        type: Number
    },
    date: {
        type: Date
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date
    },
    _userId: {
        type: String
    }
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
