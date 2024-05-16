const Ascent = require('../models/ascentModel');
const Route = require('../models/routeModel');
const CustomError = require('../utils/CustomError');
const {findOrCreateArea} = require('./areaServices');

exports.findOrCreateRoute = async (routeData, userId) => {

    let route = await Route.findOne({ name: routeData.name, user: userId});

    if (!route) {
		const area = await findOrCreateArea(routeData.area, userId);
        route = new Route({...routeData, area, user: userId });
        await route.save();
    }
    return route;
}

exports.findRoute = async (routeId, userId) => {
    const route = await Route.findById(routeId);
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
	route.area = newData.area;
    return route;
}

exports.populateRoute = async (route) => {
	const populatedRoute = await route.populate(['ascents', 'area'])
	return populatedRoute;
}

exports.populateRoutes = async (routes) => {
	const populatedRoutes = await routes.populate(['ascents', 'area'])
	return populatedRoutes;
}


exports.deleteRouteIfEmpty = async (userId, routeId) => {
	// Find the route
	const route = await Route.findById(routeId);
	const populatedRoute = await populateRoute(route);

	// Check if there are any ascents with the same route
	if (populatedRoute.ascents.length === 0) {
		const areaId = route.area;

		// delete the route
		await Route.findByIdAndDelete(routeId);

		// Check if the route area has any routes amd delete
		await deleteAreaIfEmpty(userId, areaId);
	}
}


// Function to check if the ascent is the only one for its route
exports.onlyOneAscentRecordedOnRoute = async (routeId) => {
	const route = await Route.findById(routeId);
	const populatedRoute = await populateRoute(route);
	
	const count = populatedRoute.ascents.length;
	return count === 1;
}