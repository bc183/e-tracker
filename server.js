const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');




dotenv.config();

//swagger
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Tracker API',
            version: '1.0.0',
            description: 'API for Expense Tracker app',
            contact: {
                name: 'Barath C',
                mail: 'msbarath7@gmail.com'
            },
            servers: [`http://localhost:${PORT}`],
        }
    },
    apis: ['*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//middlewares
app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: process.env.ORIGIN,
//     optionsSuccessStatus: 200
// }));

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/incomes", incomeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, './e-tracker-client/build')));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "e-tracker-client", "build", "index.html"));
    });
} else {
    //entering request.
    app.get("/", (req, res) => {
        res.status(200).json({ message: "You have entered the server for E-tracker" });
    });
}

app.listen(PORT, () => {
    console.log(`The server is running at port http://localhost:${PORT}/`);
})

mongoose.connect("mongodb+srv://bc007:msdhoni007@cluster0.dcb5w.mongodb.net/etrackerdb?retryWrites=true&w=majority", (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("database connected successfully.");
});
