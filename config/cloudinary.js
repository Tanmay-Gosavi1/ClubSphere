const cloudinary = require('cloudinary').v2
require('dotenv').config()

const cloudinaryConnect = async (req,res)=>{
    try {
        cloudinary.config({
            cloud_name : process.env.CLOUDINARY_CLOUD_NAME ,
            api_key : process.env.CLOUDINARY_API_KEY ,
            api_secret : process.env.CLOUDINARY_API_SECRET
        })  
    } catch (error) {
        console.log("Error in connecting to cloudinary" , error)
        res.status(500).json({success : false , message : "Error in connecting to cloudinary"})
    }
}
module.exports = cloudinaryConnect