const express = require('express');
const login = require('../../Controllers/AuthControllers/loginController');
const router = express.Router();


router.post("/login", login)


module.exports = router;