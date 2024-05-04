const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const routeSchema = require('../validators/routeValidator');
const {findRoute, updateRouteData} = require('../services/routeServices');
const validateSchema = require('../middleware/validateSchema')


exports.getAllRoutes = [
    async (req, res, next) => {
        try {
            const routes = await Route.find({ user: req.user._id }).populate('ascents');

            routes.forEach(route => {
                route.ascents.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
            });

            res.status(200).json(routes);
        } catch (error) {
            next(error)
        }
    }
]

exports.getRouteById = [
    async (req, res, next) => {
        try {
            const route = await findRoute(req.params.id, req.user._id);
            res.status(200).json(route);
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

            // Update the route
            const newData = {
                name: req.body.name,
                grade: req.body.grade,
                colour: req.body.colour,
                user: req.user._id
            };

            const updatedRoute = updateRouteData(route, newData);
            await updatedRoute.save();

            res.status(200).json(updatedRoute);
        } catch (error) {
            next(error)
        }
    }
]

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