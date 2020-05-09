const Car = require('../services/car');

exports.addCar = function(req, res) {
    const response={};
    Car.addNew(req.body, (err, car) => {
        if(err) {
            response.success=false;
            response.error=err.errmsg ? err.errmsg : err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Car successfully added';
            response.car=car;
            return res.status(200).json(response);
        }      
    });
}

exports.bookCar = function(req, res) {
    const response = {};
    Car.bookById(req.params.carId, req.body, (err, bookingDetails) => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Booking successful';
            response.booking=bookingDetails;
            return res.status(200).json(response);
        }
    });
}


exports.showAvailableCars = function(req, res) {
    const response={};
    Car.getAllAvailable(req.body.filters, (err, cars) => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Found available cars successfully';
            response.cars=cars;
            return res.status(200).json(response);
        }
    });
}

exports.getCarById = function(req,res) {
    const response={};
    Car.getDetails(req.params.carId, (err, car) => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Found car successfully';
            response.car=car;
            return res.status(200).json(response);
        }
    });
}

exports.updateCarById = function(req, res) {
    const response={};
    Car.updateDetails(req.params.carId, updates, (err, car) => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message='Updated car successfully';
            response.car=car;
            return res.status(200).json(response);
        }
    });
}

exports.removeCarById = function(req, res) {
    const response={};
    Car.remove(req.params.carId, err => {
        if(err) {
            response.success=false;
            response.error=err;
            return res.status(400).json(response);
        }
        else {
            response.success=true;
            response.message=`Deleted car id ${carId} successfully`;
            return res.status(200).json(response);
        }
    });
}
