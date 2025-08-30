const mongoose = require('mongoose')

const clubSchema = new mongoose.Schema({
    clubName : {
        type : String ,
        required :true ,
        trim : true
    },
    clubAdmin : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    }],
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
})

module.exports = mongoose.model("College" , collegeSchema)