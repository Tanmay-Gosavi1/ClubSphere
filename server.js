const express = require('express')
const app = express()
const connectDB = require('./config/db.js')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRoutes.js')

//Middlewares
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

//Routes
app.get('/' , (req,res)=>{
    res.send("Welcome to ClubSphere !!")
})
app.use('/api/auth' , authRouter)

//Db connect
connectDB()

//App Listen
const port = process.env.PORT || 8000
app.listen(port , ()=>{
    console.log(`Server is listening at ${port}`)
})