const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    vehicleNo : {
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    model: {
        type:String,
        trim:true,
        required:true
    },
    rentPerDay: {
        type:Number,
        required:true
    },
    seatingCapacity: {
        type:Number,
        required:true
    },
    city: {
        type:String,
        trim:true,
        required:true
    },
    latestBooking: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Booking',
        default:null
    },
    bookingHistory: {
        type:Array,
        default:[]
    }
}, {timestamps:true});


module.exports = mongoose.model('Car', carSchema);
