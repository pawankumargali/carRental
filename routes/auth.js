const router = require('express').Router();
const {signUpValidator, signInValidator} = require('../input_validators/auth');
const { signUp, signIn } = require('../controllers/auth');

router.post('/signup', signUpValidator, signUp);
router.post('/signin', signInValidator, signIn);

module.exports = router;