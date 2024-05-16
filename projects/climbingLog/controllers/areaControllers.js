const Area = require('../models/areaModel');

exports.getAllAreas = [
    async (req, res, next) => {
        try {
			const areas = await Area.find({ user: req.user._id })
            res.status(200).json(areas);
        } catch (error) {
            next(error)
        }
    }
]
