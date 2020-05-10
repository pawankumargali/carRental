exports.carInputValidator = function(req, res, next) {
    const response={};
    response.success=false;
    const {vehicleNo, model, seatingCapacity, rentPerDay, city } = req.body;
    if(!vehicleNo || !model || !seatingCapacity || !rentPerDay || !city) {
        response.message='Missing fields: All fields vehicleNo, model, seatingCapacity, rentPerDay and city are required';
        return res.status(400).json(response);
    }
    const hasAlphabet = vehicleNo.match(/(?=.*[a-zA-Z])/);
    const hasDigit = vehicleNo.match(/(?=.*[0-9])/);
    const hasSpecialCharacter = vehicleNo.match(/(?=.*[\!\@\#\$\%\^\&\*])/);
    if(hasSpecialCharacter) {
        response.message='vehicleNo field cannot contain special characters';
        return res.status(400).json(response);
    }
    if(!hasAlphabet || !hasDigit) {
        response.message='vehicleNo field must contain atleast 1 alphabet and 1 digit';
        return res.status(400).json(response);
    }
    return next();
}



exports.bookingInputValidator = function(req, res, next) {
    const response={};
    response.success=false;
    const { carId } = req.params;
    if(!carId) {
        response.message('Missing route param carId');
        return res.status(400).json(response);
    }
    const { issueDate, returnDate } = req.body;
    if(!issueDate || !returnDate) {
        response.message= 'Missing fields: Fields issueDate and returnDate are required';
        return res.status(400).json(response);
    }
    if(!isValidDate(issueDate) || !isValidDate(returnDate)) {
        response.message=`issueDate and returnDate must be valid date strings "MM:DD:YYYY HH:MM"`;
        return res.status(400).json(response);
    }
    else return next();
}


exports.showCarsInputValidator = function(req, res, next) {
    const response = {};
    response.success=false;
    const { issueDate, returnDate } = req.body.filters ? req.body.filters : {};
    if((issueDate && !isValidDate(issueDate)) || (returnDate && !isValidDate(returnDate))) {
        response.message=`issueDate and returnDate must be valid date strings "MM:DD:YYYY HH:MM"`;
        return res.status(200).json(response);
    }
    return next();
}


function isValidDate(dateString) {
    const checkDate = new Date(dateString);
    const dateNum=Number(Date.parse(checkDate));
    if(isNaN(dateNum)) return false;
    else return true;
}