const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const ascentSchema = require('../validators/ascentValidator')
const validateSchema = require('../middleware/validateSchema')
const { findAscent, updateAscentData, uploadAscents } = require('../services/ascentServices')
const { findOrCreateRoute } = require('../services/routeServices')


exports.createAscent = [
    validateSchema(ascentSchema),
    async (req, res, next) => {
        try {

            // Check if the route already exists in the database
            let route = await findOrCreateRoute(req.body.route, req.user._id);

            const ascent = new Ascent({
                user: req.user._id,
                route: route._id,
                date: req.body.date,
                tickType: req.body.tickType,
                notes: req.body.notes
            });

            await ascent.save();

            const populatedAscent = await Ascent.findById(ascent._id).populate('route');
            res.status(201).json(populatedAscent);
        } catch (error) {
            next(error)
        }
    }
]

exports.getAllAscents = [
    async (req, res, next) => {
        try {
            const ascents = await Ascent.find({ user: req.user._id }).populate('route');
            res.status(200).json(ascents);
        } catch (error) {
            next(error)
        }
    }
]

exports.getAscentById = [
    async (req, res, next) => {
        try {
            const ascent = await findAscent(req.params.id, req.user._id);
            const ascentObject = ascent.toObject();
            ascentObject.isOnlyAscent = await Ascent.countDocuments({ route: ascent.route._id }) === 1;

            res.status(200).json(ascentObject);
        } catch (error) {
            next(error)
        }
    }
]

exports.updateAscent = [
    validateSchema(ascentSchema),
    async (req, res, next) => {
        try {

            const ascent = await findAscent(req.params.id, req.user._id);

            // Check if the route already exists in the database
            const route = await findOrCreateRoute(req.body.route, req.user._id)

            const newData = {
                user: req.user._id,
                route: route._id,
                date: req.body.date,
                tickType: req.body.tickType,
                notes: req.body.notes
            };
            const updatedAscent = updateAscentData(ascent, newData);
            await updatedAscent.save();

            // Populate the route field before sending the response
            const populatedAscent = await Ascent.findById(updatedAscent._id).populate('route');

            res.status(200).json(populatedAscent);
        } catch (error) {
            next(error)
        }
    }
]

exports.deleteAscent = [
    async (req, res, next) => {
        try {
            const ascent = await findAscent(req.params.id, req.user._id);

            // Store the route id before deleting the ascent
            const routeId = ascent.route;

            // Delete the ascent
            await ascent.deleteOne();

            // Check if there are any other ascents with the same route
            const otherAscents = await Ascent.find({ route: routeId });
            if (otherAscents.length === 0) {
                // If not, delete the route
                await Route.findByIdAndDelete(routeId);
            }

            res.status(200).json({ message: 'Ascent deleted successfully' });
        } catch (error) {
            next(error)
        }
    }
]

/**
 * When creating a new ascent, this will prefill the date field with the date of the last ascent 
 * recorded if recorded within the last 24 hours or the current date if not.
 */
//TODO: Test if function works as expected
exports.prefillAscentDate = [
    async (req, res, next) => {
    
        try {
            // Find the creation date of the last recorded ascent
            const lastCreatedAscent = await Ascent.findOne().sort({createdAt: -1});

            // If the ascent was created within the last 24 hours, return the date of the ascent
            const millisecondsInDay = 86400000;
            if (lastCreatedAscent && (Date.now() - new Date(lastCreatedAscent.createdAt).getTime() < millisecondsInDay)) {
                return res.status(200).json({ date: lastCreatedAscent.date });
            } else {
                return res.status(200).json({ date: new Date().toISOString() });
            }

        } catch (error) {
            next(error)
        }
    }
]

exports.uploadAscents = [
    async (req, res) => {
        // Remove all Ascents and Routes from the logged in user
        await Ascent.deleteMany({ user: req.user._id });
        await Route.deleteMany({ user: req.user._id });
        await uploadAscents(req.user._id);

        res.status(200).json({ message: 'Uploaded ascents' });
    }
]