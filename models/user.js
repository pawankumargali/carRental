const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    email: {
        type:String,
        trim:true,
        unique:true,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    role: {
        type:Number,
        default:0
    }
}, {timestamps:true});


userSchema.methods.hashPassword = function(password) {
    
}

userSchema.methods.authenticate = function(password) {
    
}

module.exports = mongoose.model('User',userSchema);