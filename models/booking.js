const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerName: {
        type:String,
        trim:true,
        required:true
    },
    customerContact:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    issueDate: {
        type:Date,
        required:true,
    },
    returnDate: {
        type:Date,
        required:true
    }
}, {timestamps:true});

module.exports = mongoose.model('Booking', bookingSchema);