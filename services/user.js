class User {

constructor() {
    this.UserModel = require('../models/user');
    this.bcrypt = require('bcrypt');
    this.jwt = require('jsonwebtoken');
}

register(regDetails, callback) {
    const {name, email, password, contact, role} = regDetails;
    this.UserModel.findOne({email}, (err, user) => {
        if(err) return callback(err, null);
        if(user) {
            const error = {};
            error.message='User already exists. Please login';
            return callback(err, null);
        }
        const hash = this._hashPassword(password);
        const newUser = new this.UserModel({name, email, password:hash, contact, role});
        newUser.save()
                .then(savedUser => callback(null,savedUser.role))
                .catch(err => callback(err, null));
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
    this.jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            error.message='Invalid Token';
            error.err=err;
            return callback(error,null);
        }
        if(!user) return callback(error, null);
        const auth = {isAuth:true, id:user._id, role:user.role};
        return callback(null,auth);
    });           
}

_hashPassword(password) {
    const saltRounds = 10;
    const hash = this.bcrypt.hashSync(password, saltRounds);
    return hash;
}

_matchPassword(password, hash) {
    const result = this.bcrypt.compareSync(password,hash);
    return result;
}

}

module.exports = new User();