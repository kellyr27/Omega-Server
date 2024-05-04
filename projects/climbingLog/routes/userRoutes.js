const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userController = require('../controllers/userController');

// Create Account
router.post('/register', ...userController.register)

// Login
router.post('/login', ...userController.login);

module.exports = router;