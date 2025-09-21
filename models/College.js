const mongoose = require('mongoose')

const collegeSchema = new mongoose.Schema({
    collegeName : {
        type : String ,
        required :true ,
        trim : true
    },
    club : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Club"
    }] ,
    student : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model("College" , collegeSchema)
