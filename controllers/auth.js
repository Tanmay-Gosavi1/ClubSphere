const User = require('../models/User.js')
const bcrypt = require('bcryptjs')
const College = require('../models/College.js')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
    try {
        const { userName, email, password, role, college } = req.body

        if (!userName || !email || !password || !role || !college) {
            return res.status(400).json({ success: false, message: "Incomplete credentials" })
        }

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const coll = await College.findOne({ collegeName: college })
        if (!coll) {
            coll = await College.create({
                collegeName : college ,
            })
            console.log("New college created")
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            userName: userName,
            email: email,
            password: hashedPassword,
            role: role,
            college: coll._id 
        })

        await College.findByIdAndUpdate(coll._id , {
            $push : {
                student : newUser._id
            }
        })

        // Optionally, create a JWT token on signup
        const payload = {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            college: newUser.college
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

        return res.status(201).json({ success: true, message: "Signup successful", user: newUser, token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Issue while signing up" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Incomplete credentials" })
        }

        const existingUser = await User.findOne({ email: email })
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" })
        }

        const payload = {
            _id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
            college: existingUser.college
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

        return res.status(200).json({ success: true, message: "Login successful", token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Issue while logging in" })
    }
}  