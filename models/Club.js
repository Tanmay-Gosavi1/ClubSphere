const mongoose = require('mongoose')

const clubSchema = new mongoose.Schema({
    clubName : {
        type : String ,
        required :true ,
        trim : true
    },
    clubDescription : {
        type : String ,
        required : true ,
        trim : true
    },
    clubPhotos : [{
        type : String ,
        required : true
    }],
    clubAdmin : [{
        type : String ,
    }],
    members : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    recentEvents : [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : "Event" 
        }
    ]
})

module.exports = mongoose.model("Club" , clubSchema)