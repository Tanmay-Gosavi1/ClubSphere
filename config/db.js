const mongoose = require('mongoose')

const connectDB = async (req,res) => {
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Db is connected successfully")
    })
    .catch((err)=>{
        console.log(err)
        console.log("Issue while connecting to db")
        process.exit(1)
    })
}

module.exports = connectDB