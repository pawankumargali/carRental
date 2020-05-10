const User = require('../services/user');

exports.signUp = function(req,res) {
    const response = {};
    User.register(req.body, err => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Registered user successfully. Proceed to Login';
            return res.status(200).json(response);
        }
    });
}

exports.signIn = function(req,res) {
    const response = {};
    User.login(req.body, (err, token) => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Login Successful';
            response.token = token;
            return res.status(200).json(response);
        }
    });
}


exports.requireSignIn = function(req, res, next) {
    const response={};
    response.success=false;
    const authHeader = req.header('Authorization');
    User.getAuthDetails( authHeader, (err, auth) => {
        if(err) {
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            req.auth=auth;
            return next();
        }
    })
}

exports.isAuth = function(req,res, next) {
    const response = {};
    response.error='Unauthenticated request. Pleae login';
    const  { isAuth } = req.auth;
    if(!isAuth) return res.status(400).json(response);
    return next();
}

exports.isAdmin = function(req, res, next) {
    const response = {};
    const  { isAuth, role } = req.auth;
    if(!isAuth) {
        response.error='Unauthenticated request. Pleae login';
        return res.status(400).json(response);
    }
    else if(role===0) {
        response.error='Unauthorized user. Admin only access';
        return res.status(400).json(response);
    } 
    else return next();
}