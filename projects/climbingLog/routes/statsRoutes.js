const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');

 
router.route('/grade-pyramid')
    .get(authenticate, ...statsController.getGradePyramid);

router.route('/performance-rating')
    .get(authenticate, ...statsController.getPerformanceRating);

router.route('/weekly-stats')
    .get(authenticate, ...statsController.getWeeklyStats);

router.route('/area-stats')
	.get(authenticate, ...statsController.getAreaStats);

router.route('/tickType-stats')
	.get(authenticate, ...statsController.getTickTypeStats);

module.exports = router;

