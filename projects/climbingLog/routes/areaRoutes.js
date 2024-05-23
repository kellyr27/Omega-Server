const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const authenticate = require('../middleware/authenticate');

router.route('/')
    .get(authenticate, ...areaController.getAllAreas);

router.route('/:id')
    .get(authenticate, ...areaController.getAreaById)
    .put(authenticate, ...areaController.updateArea)

module.exports = router;