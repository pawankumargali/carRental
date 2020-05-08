exports.newCarInputValidator = function(req, res, next) {
    const {vehicleNo, model, seatingCapacity, rentPerDay, city } = req.body;
    if(!vehicleNo || !model || !seatingCapacity || !rentPerDay || !city) {
        const response={};
        response.success=false;
        response.message='Missing fields: All fields vehicleNo, model, seatingCapacity, rentPerDay and city are required';
        return res.status(400).json(response);
    }
    else return next();
}