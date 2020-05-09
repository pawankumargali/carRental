const router = require('express').Router();
const { addCar, bookCar, showAvailableCars, getCarById, 
        updateCarById, removeCarById 
      } = require('../controllers/car');
const { carInputValidator, bookingInputValidator, 
        showCarsInputValidator 
      } = require('../input_validators/index');

router.post('/car/add', carInputValidator, addCar);
router.post('/car/book/:carId', bookingInputValidator, bookCar);
router.post('/cars', showCarsInputValidator, showAvailableCars);
router.get('/car/:carId', getCarById);
router.put('/car/:carId', updateCarById);
router.delete('/car/:carId', removeCarById);

module.exports=router;