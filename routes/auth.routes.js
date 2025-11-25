const User = require("../models/User.model")

const router = require("express").Router()

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middlewares/auth.middlewares")

// POST "/api/auth/signup" => creates the document of the user
router.post("/signup", async(req,res,next) => {

    console.log(req.body)
    const { username , email, password } = req.body

    // 1. The email should be unique
    if (!username || !email ||!password) {
        res.status(400).json({ErrorMessage: "Username, password and email properties are mandatory"})
        return; // Stop the route
    }

    // 2. The password should follow roules to be strong
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/g
    if (passwordRegex.test(password) === false) {
        res.status(400).json({ErrorMessage: "Password is not strong enough, it neds at least one uppercase, one lowercasse, one number and 8 characters"})
        return; // Stop the route
    }
    
    // Extra. Email should have the correct format
    // Extra. Username also be unique
    // Extra. Max length and min length of username or email

    try {

        // 3. Email user should be unique
        const foundUser = await User.findOne({email: email})
        // Response could be null if there is no other user with that email
        // Response could be a user object if there is a user with that email
        if (foundUser) {
            res.status(400).json({ErrorMessage: "user found with the same email. Please login or use a different email to signup"})
            return; // Stop the route
        }

        // Hash the password because we are good devs :)
        const hashPassword = await bcrypt.hash(password, 12)

        await User.create({
            username: username,
            email: email,
            password: hashPassword
        })

        res.sendStatus(200)
        
    } catch (error) {
        next(error)
    }
})

// POST "/api/auth/login" => verify user credentials (authenticate the user) and send the token
router.post("/login", async (req,res,next) => {
    console.log(req.body)

    const {email, password} = req.body

    if (!email || !password) {
        res.status(400).json({ErrorMessage: "Email and password properties are mandatory"})
        return; //Stop the route
    }

    try {

        const foundUser = await User.findOne({email: email})
        console.log(foundUser)
        if (!foundUser) {
             res.status(400).json({ErrorMessage: "No user with that email, please sign up first or try a different email"})
            return; // Stop the route
        }

        const isPasswordMatch = await bcrypt.compare(password, foundUser.password)
        if(isPasswordMatch === false) {
            res.status(400).json({ErrorMessage: "Password is not correct, try again"})
            return; // Stop the route
        }

        // At this point we have succesfully authenticated the user

        // The payload is the hashed info from the user that should be UNIQUE and STATIC
        const payload = {
            _id: foundUser._id,
            email: foundUser.email
        }

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
            altgorithm: "HS256", expiresIn: "7d"
        })

        res.status(200).json({authToken: authToken})

    } catch (error) {
        next(error)
    }
})

// GET "/api/auth/verify" => indicate to the client who the user is
router.get("/verify", verifyToken,(req,res) => {

// We validate the token, and then send to the client who this person is by passing the payload
res.status(200).json(req.payload)

})

module.exports = router