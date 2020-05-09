const router = require('express').Router();
const { addCar, bookCar, showAvailableCars } = require('../controllers/car');
const { carInputValidator, bookingInputValidator, showCarsInputValidator } = require('../input_validators/index');

router.post('/car/add', carInputValidator, addCar);
router.post('/car/book/:carId', bookingInputValidator, bookCar);
router.post('/cars', showCarsInputValidator, showAvailableCars)

module.exports=router;