const jwt = require("jsonwebtoken");
//model imports
const User = require("../models/User");


const auth = async (req, res, next) => {
    let authorization = req.headers.authorization;


    if (authorization === null | authorization === undefined) {
        return res.status(403).json({ error: "Token not found" });
    }
    //Bearer token
    
    try {
        let token = authorization.substring(7,);

        //console.log(token);
        const username = jwt.verify(token, process.env.JWTSECRET);
        const user = await User.findOne({ username: username });
        if (user === null) {
            return res.status(403).json({ error: "Token is not valid" });
        }
        res.locals.user = user;

        return next();
    } catch (error) {
        return res.status(500).json({ error: "Token is not valid." });
    }

}

module.exports = auth;