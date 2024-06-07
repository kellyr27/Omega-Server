const Area = require('../models/areaModel');
const {findArea, updateAreaData, populateArea} = require('../services/areaServices');
const areaSchema = require('../validators/areaValidator');
const validateSchema = require('../middleware/validateSchema');


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

exports.getAreaById = [
	async (req, res, next) => {
		try {
			const area = await findArea(req.params.id, req.user._id);
			const populatedArea = await populateArea(area);

			res.status(200).json(populatedArea)
		} catch (error) {
			next(error)
		}
	}
]

exports.updateArea = [
	validateSchema(areaSchema),
	async (req, res, next) => {
		try {
			const area = await findArea(req.params.id, req.user._id)

			const newData = {
				name: req.body.name,
				steepnessTags: req.body.steepnessTags
			}

			const updatedArea = updateAreaData(area, newData);
			await updatedArea.save();

			res.status(200).json(updatedArea);

		} catch (error) {
			next(error)
		}
	}
]
