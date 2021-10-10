const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
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

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
