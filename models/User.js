const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName : {
        type : String ,
        required :true ,
        trim : true
    },
    email : {
        type : String ,
        required :true ,
        trim : true,
        unique : true
    },
    password : {
        type : String ,
        required : true ,
    },
    role : {
        type : String ,
        enum  : ["admin" , "user", "clubadmin"] ,
        default : "user" ,
        required : true
    },
    club : [
        {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Club"
        }   
    ]
})

module.exports = mongoose.model("User" , userSchema)