exports.carInputValidator = function(req, res, next) {
    const {vehicleNo, model, seatingCapacity, rentPerDay, city } = req.body;
    if(!vehicleNo || !model || !seatingCapacity || !rentPerDay || !city) {
        const response={};
        response.success=false;
        response.message='Missing fields: All fields vehicleNo, model, seatingCapacity, rentPerDay and city are required';
        return res.status(400).json(response);
    }
    else return next();
}



exports.bookingInputValidator = function(req, res, next) {
    const { carId } = req.params;
    const {username, contact, issueDate, returnDate } = req.body;
    if(!username || !contact || !issueDate || !returnDate ||!carId) {
        const response={};
        response.success=false;
        response.message= !carId ? 'Missing route parameter carId':'Missing fields: All fields username, contact, issueDate and returnDate are required';
        return res.status(400).json(response);
    }
    // Ensure issue and return dates are dates in specified format
    else return next();
}


exports.showCarsInputValidator = function(req, res, next) {
    return next();
}