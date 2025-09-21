const User = require('../models/User.js')
const bcrypt = require('bcryptjs')
const College = require('../models/College.js')
const jwt = require('jsonwebtoken')


exports.signup = async (req, res) => {
    try {
        const { userName, email, password, college } = req.body

        if (!userName || !email || !password.trim() || !college) {
            return res.status(400).json({ success: false, message: "Incomplete credentials" })
        }

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        // Check if college exists
        const isCollegeExists = await College.findOne({ collegeName: college })
        let collegeId;
        
        if (!isCollegeExists) {
            // Create college if it doesn't exist
            const newCollege = await College.create({ collegeName: college })
            collegeId = newCollege._id;
        } else {
            collegeId = isCollegeExists._id;
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            userName: userName,
            email: email,
            password: hashedPassword,
            college: collegeId
        })

        if (!newUser) {
            return res.status(500).json({ success: false, message: "Error in creating user" })
        }

        // Add user to college's student array
        await College.findByIdAndUpdate(collegeId, {
            $push: { student: newUser._id }
        })

        // Optionally, create a JWT token on signup
        const payload = {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            college: newUser.college
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token',token,{
            httpOnly : true ,
            secure : true , // Use this in production with HTTPS
            sameSite : 'strict',
            maxAge : 7*24*60*60*1000 // 7 days
        })

        return res.status(201).json({ success: true, message: "Signup successful", user: newUser, token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Issue while signing up" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password.trim()) {
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
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token',token,{
            httpOnly : true ,
            secure : true , // Use this in production with HTTPS
            sameSite : 'strict',
            maxAge : 7*24*60*60*1000 // 7 days
        })

        return res.status(200).json({ success: true, message: "Login successful", token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Issue while logging in" })
    }
}  

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token') // Clear the cookie -> 'token'

        return res.status(200).json({ success: true, message: "Logout successful" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Issue while logging out" })
    }   
}