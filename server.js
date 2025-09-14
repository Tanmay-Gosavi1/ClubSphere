const express = require('express')
const app = express()
require('dotenv').config()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const cors = require('cors')

const connectDB = require('./config/db.js')
const cloudinary = require('./config/cloudinary.js')
const authRouter = require('./routes/authRoutes.js')
const clubRoutes = require('./routes/clubRoutes.js')
const cloudinaryConnect = require('./config/cloudinary.js')

//Middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors( {
    origin: 'http://localhost:8001',
    credentials: true,
}))
app.use(fileUpload({
    useTempFiles : true ,
    tempFileDir : '/tmp/'
}))
cloudinaryConnect()

//Routes
app.get('/' , (req,res)=>{
    res.send("Welcome to ClubSphere !!")
})
app.use('/api/auth' , authRouter)
app.use('/api/club' , clubRoutes)

//Db connect
connectDB()

//App Listen
const port = process.env.PORT || 8000
app.listen(port , ()=>{
    console.log(`Server is listening at ${port}`)
})