const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    eventName : {
        type : String ,
        required : true , 
        trim : true
    },
    eventPhoto : {
        type : String ,
        required : true
    }
})

module.exports = mongoose.model("Event" , eventSchema)