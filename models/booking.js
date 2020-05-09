const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    username: {
        type:String,
        trim:true,
        required:true
    },
    contact:{
        type:String,
        trim:true,
        required:true,
    },
    issueDate: {
        type:Date,
        required:true,
    },
    returnDate: {
        type:Date,
        required:true
    },
    car: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Car'
    },
    bill: {
        type:Number,
        required:true
    }
}, {timestamps:true});

module.exports = mongoose.model('Booking', bookingSchema);