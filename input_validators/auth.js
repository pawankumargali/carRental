exports.signUpValidator = function(req, res, next) {
    const { name, email, password, contact } = req.body;
    const response={};
    response.success=false;
    if(!name || !email || !password || !contact) {
        response.message='Missing fields: All fields name, email, password and contact are required';
        return res.status(400).json(response);
    }    
    if(!isValidEmail(email)) {
        response.message = 'Please enter valid email id';
        return res.status(400).json(response);
    }
    if(password.length<5) {
        response.message='Password should be min 5 characters';
        return res.status(400).json(response);
    }
    const hasLowerCaseLetter = password.match(/(?=.*[a-z])/);
    const hasUpperCaseLetter = password.match(/(?=.*[A-Z])/);
    const hasDigit = password.match(/(?=.*[0-9])/);
    const hasSpecialCharacter = password.match(/(?=.*[\!\@\#\$\%\^\&\*])/);
    if(!hasLowerCaseLetter || !hasUpperCaseLetter || !hasDigit || !hasSpecialCharacter) {
        response.message = 'Password must contain atleast 1 lower-case letter, 1 upper-case letter, 1 digit and 1 special character';
        response.status(400).json(response);
    }
    return next();
}



exports.signInValidator = function(req, res, next) {
    const { email } = req.body;
    if(!isValidEmail(email)) {
        response.message = 'Please enter valid email id';
        return res.status(400).json(response);
    }
    return next();
}

function isValidEmail(email) {
    const emailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if(email.match(emailRegExp)) return true;
    return false;
}

