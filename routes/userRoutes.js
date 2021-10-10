const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const auth = require('../middlewares/auth');


const router = express.Router();

const register = async (req, res) => {
    const { username, firstName, lastName, email, confirmPassword } = req.body;
    let password = req.body.password;
    errors = {}

    //validate empty.
    if (username.trim().length === 0) {
        errors.username = "Username cannot be empty/null";
    }
    if (firstName.trim().length === 0) {
        errors.firstName = "firstName cannot be empty/null";
    }
    if (lastName.trim().length === 0) {
        errors.lastName = "lastName cannot be empty/null";
    }
    if (email.trim().length === 0) {
        errors.email = "email cannot be empty/null";
    }
    if (confirmPassword.trim().length === 0) {
        errors.confirmPassword = "confirmPassword cannot be empty/null";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }
    //validate email and password match.
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Email is not valid" });
    }
    if (!validator.equals(password, confirmPassword)) {            
        return res.status(400).json({ error: "Password and confirm password doesn't  match" });
    }

    //validate existing username and email.
    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        user = await User.findOne({ username: username }); 
        if (user) {
            return res.status(400).json({ error: "User with this username already exists" });
        }
        //encrypt password
        let encodedPassword = await bcrypt.hash(password, 6);
        //save user.
        const modelUser = new User({  
            username,
            email,
            password: encodedPassword,
            firstName,
            lastName,
            createdAt: new Date(),
        });
        const savedUser = await modelUser.save();
        return res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    let errors = {};

    if (username.trim().length == 0) {
        errors.username = "Username cannot be empty";
    }
    if (password.trim() === "") {
        errors.password = "Password cannot be empty";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }


    try {
        const user = await User.findOne({ username: username });
        if (user === null) {
            return res.status(400).json({ error: "Username/password is wrong." });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Username/password is wrong." });
        } 

        const token = jwt.sign(username, process.env.JWTSECRET);

        return res.status(200).json({  
            user: {
                _id: user._id,
                username: user.username
            },
            token: token
        });


    } catch (error) {
        return res.status(500).json({ error: "Something went wrong!" });
    }
}

const me = (req, res) => {
    let user = res.locals?.user;
    if (user === undefined) {
        return res.status(403).json({ error: "Unauthenticated" });
    }
    user.password = null;
    return res.status(200).json(user);
}

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);


module.exports = router;