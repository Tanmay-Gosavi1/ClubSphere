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
    ],
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    approvedAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Club" , clubSchema)