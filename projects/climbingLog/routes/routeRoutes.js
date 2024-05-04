const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authenticate = require('../middleware/authenticate');
 
router.route('/')
    .get(authenticate, ...routeController.getAllRoutes);

router.route('/:id')
    .get(authenticate, ...routeController.getRouteById)
    .put(authenticate, ...routeController.updateRoute)

router.route('/:id/ascents')
    .get(authenticate, ...routeController.getAscentsByRouteId);


module.exports = router;