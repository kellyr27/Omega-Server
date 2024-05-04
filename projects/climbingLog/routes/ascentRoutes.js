const express = require('express');
const router = express.Router();
const ascentController = require('../controllers/ascentController');
const authenticate = require('../middleware/authenticate');

 
router.route('/')
    .post(authenticate, ...ascentController.createAscent)
    .get(authenticate, ...ascentController.getAllAscents);

router.route('/upload')
    .get(authenticate, ...ascentController.uploadAscents)

router.route('/prefill-ascent-date')
    .get(authenticate, ...ascentController.prefillAscentDate);


router.route('/:id')
    .get(authenticate, ...ascentController.getAscentById)
    .put(authenticate, ...ascentController.updateAscent)
    .delete(authenticate, ...ascentController.deleteAscent);

module.exports = router;