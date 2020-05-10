const router = require('express').Router();
const { requireSignIn, isAuth, isAdmin } = require('../controllers/auth');
const { addCar, bookCar, showAvailableCars, getCarById, updateCarById, removeCarById } = require('../controllers/car');
const { carInputValidator, bookingInputValidator, showCarsInputValidator, updateCarInputValidator } = require('../input_validators/car');

router.post('/car/add', requireSignIn, isAdmin, carInputValidator, addCar);
router.post('/car/book/:carId', requireSignIn, isAuth, bookingInputValidator, bookCar);
router.post('/cars', showCarsInputValidator, showAvailableCars);
router.get('/car/:carId', getCarById);
router.put('/car/:carId', requireSignIn, isAdmin, updateCarInputValidator, updateCarById);
router.delete('/car/:carId', requireSignIn, isAdmin, removeCarById);

module.exports=router;