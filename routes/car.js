const router = require('express').Router();
const { addCar } = require('../controllers/car');
const { newCarInputValidator } = require('../input_validators/car');

router.post('/car/add', newCarInputValidator, addCar);

module.exports=router;