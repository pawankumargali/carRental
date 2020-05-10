const router = require('express').Router();
const {signUpValidator, signInValidator} = require('../input_validators/auth');
const { signUp, signIn } = require('../controllers/auth');

router.post('/auth/signup', signUpValidator, signUp);
router.post('/auth/signin', signInValidator, signIn);

module.exports = router;