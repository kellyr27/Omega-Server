const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const CustomError = require('../utils/CustomError');

// TODO Add user
// TODO Error checking that route exists for that user only
exports.findOrCreateRoute = async (routeData, userId) => {

    let route = await Route.findOne({ name: routeData.name, user: userId});

    if (!route) {
        route = new Route({...routeData, user: userId });
        await route.save();
    }
    return route;
}

exports.findRoute = async (routeId, userId) => {
    const route = await Route.findById(routeId).populate('ascents');
    if (!route) {
        throw new CustomError('No route found with this id', 404);
    }
    if (route.user.toString() !== userId.toString()) {
        throw new CustomError('You do not have permission to access this route', 403);
    }
    return route;
}

exports.updateRouteData = (route, newData) => {
    route.name = newData.name;
    route.colour = newData.colour;
    route.grade = newData.grade;
    route.user = newData.user;
    return route;
}