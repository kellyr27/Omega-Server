const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const routeSchema = require('../validators/routeValidator');
const {findRoute, updateRouteData, populateRoute, populateRoutes} = require('../services/routeServices');
const validateSchema = require('../middleware/validateSchema');
const { deleteAreaIfEmpty, findOrCreateArea } = require('../services/areaServices');


exports.getAllRoutes = [
    async (req, res, next) => {
        try {
            const routes = await Route.find({ user: req.user._id });
			const populatedRoutes = await populateRoutes(routes);

            res.status(200).json(populatedRoutes);
        } catch (error) {
            next(error)
        }
    }
]

exports.getRouteById = [
    async (req, res, next) => {
        try {
            const route = await findRoute(req.params.id, req.user._id);
			const populatedRoute = await populateRoute(route);

            res.status(200).json(populatedRoute);
        } catch (error) {
            next(error)
        }
    }
]

exports.updateRoute = [
    validateSchema(routeSchema),
    async (req, res, next) => {
        try {
            const route = await findRoute(req.params.id, req.user._id);
			
			// Get the id of the existing area
			const existingAreaId = route.area ? route.area : null;
			
            // Update the route
            const newData = {
                name: req.body.name,
                grade: req.body.grade,
                colour: req.body.colour,
                user: req.user._id,
				// area: area._id
            };

			if (req.body.area && req.body.area.name !== '') {
				const area = await findOrCreateArea(req.body.area, req.user._id)
				newData.area = area._id;
			}

            const updatedRoute = updateRouteData(route, newData);

			// If no area is provided and there is an existing area, remove the area from the route
			if (!req.body.area && existingAreaId) {
				updatedRoute.area = null;
			}

            await updatedRoute.save();

			if (existingAreaId) {
				await deleteAreaIfEmpty(req.user._id, existingAreaId)
			}

			// Populate the updated route
			const populatedRoute = await populateRoute(updatedRoute);

            res.status(200).json(populatedRoute);
        } catch (error) {
            next(error)
        }
    }
]

// DEFUNCT - TODO: Remove
exports.getAscentsByRouteId = [
    async (req, res, next) => {
        try {
            const route = findRoute(req.params.routeId, req.user._id);
            const ascents = await Ascent.find({ route: route._id, user: req.user._id});
            res.status(200).json({ route, ascents });
        } catch (error) {
            next(error)
        }
    }
]