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

