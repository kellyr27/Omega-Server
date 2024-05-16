const express = require('express');
const router = express.Router();
const ascentController = require('../controllers/ascentController');
const authenticate = require('../middleware/authenticate');

 
router.route('/')
    .get(authenticate, ...areaController.getAllAreas);