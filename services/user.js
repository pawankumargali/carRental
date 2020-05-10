class User {

constructor() {
    this.UserModel = require('../models/user');
    this.bcrypt = require('bcrypt');
    this.jwt = require('jsonwebtoken');
}

register(regDetails, callback) {
    const {name, email, password, contact } = regDetails
    this.UserModel.findOne({email}, (err, user) => {
        if(err) return callback(err);
        if(user) {
            const error = {};
            error.message='User already exists. Please login';
            return callback(err);
        }
        const hash = this._hashPassword(password);
        const newUser = new this.UserModel({name, email, password:hash, contact});
        newUser.save()
                .then(() => callback(null))
                .catch(err => callback(err));
    });
}

login(loginDetails, callback) {
    const {email, password} = loginDetails;
    this.UserModel.findOne({email}, (err, user) => {
        if(err) return callback(err,null);
        if(!user) {
            const error = {};
            error.message = 'User doesn\'t exist. Please register';
            return callback(error,null);
        }
        const isMatch = this._matchPassword(password, user.password);
        if(!isMatch) {
            const error={};
            error.message='Login Failed. Invalid Password'
            return callback(error,null);
        }
        const token = this.jwt.sign({_id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:"1h"});
        return callback(null,token);
    });
}

getAuthDetails(authHeader, callback) {
    const error = {};
    error.message='Unauthenticated request. Please login';
    if(!authHeader) return callback(error, null);
    const token = authHeader.split(' ')[1];
    if(!token) return callback(error,null);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            error.message='Invalid Token';
            error.err=err;
            return callback(error,null);
        }
        const user = decoded.user;
        if(!user) return callback(error, null);
        const auth = {isAuth:true, id:user._id, role:user.role};
        return callback(null,auth);
    });           
}

_hashPassword(password) {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}

_matchPassword(password) {
    const result = bcrypt.compareSync(password,this.password);
    return result;
}

}

module.exports = new User();


// exports.signUp = function(req,res) {
//     const {name, email, password, } = req.body;
//     let user = new User({name:name, email:email});
//     user.password = user.hashPassword(password);
//     try {
//         await user.save();
//         user.password = undefined;
//         res.status(200).json(user);
//     }
//     catch(err) {
//         res.status(400).json({err:dbErrorHandler(err)});
//     }
// }

// exports.signIn = async function(req,res) {
//     const {email, password} = req.body;
//     try {
//         const user = await User.findOne({email:email});
//         if(!user) 
//             return res.status(400).json({err:'user is not registered. Please sign up'});
//         // Authenticate User
//         isValid = user.authenticate(password);
//         // If user is unauthenticated
//         if(!isValid) 
//             return res.status(401).json({err:'Invalid password'});
//         //If user is authenticated, generate token and send response cookie
//         const token = jwt.sign({id:user._id, role:user.role},process.env.JWT_SECRET, {expiresIn:'3h'});
//         // Persist token as 't'
//         // res.cookie('t',token, { maxAge: 900000, httpOnly: true }); 
//         user.password=undefined;
//         return res.status(200).json({token:token, user});
//     }
//     catch(err) {
//         res.status(400).json({err:dbErrorHandler(err)});
//     }
// }

// module.exports.requireSignIn = async function(req,res, next) {
//     const errMsg = {msg: 'Unauthenticated request. Please sign in'};
//     // const token = req.cookies.t;
//     const token = req.header('Authorization').split(' ');
//     if(!token) 
//         return res.status(401).json(errMsg);
//     try {
//         const user = await jwt.verify(token[1],process.env.JWT_SECRET);
//         if(!user)
//             return res.status(401).json(errMsg);
//         req.auth = {auth:true, id:user.id, role:user.role};
//         next();
//     }
//     catch(err) {
//         res.status(400).json({err:err});
//     }
// }