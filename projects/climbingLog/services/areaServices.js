const Area = require('../models/areaModel');
const Route = require('../models/routeModel');
const CustomError = require('../utils/CustomError');

exports.findOrCreateArea = async (areaData, userId) => {
	
    let area = await Area.findOne({ name: areaData.name, user: userId});

    if (!area) {
        area = new Area({ ...areaData, user: userId });
        await area.save();
    }

    return area;
}

exports.findArea = async (areaId, userId) => {
    const area = await Area.findById(areaId);
    if (!area) {
        throw new CustomError('No area found with this id', 404);
    }
    if (area.user.toString() !== userId.toString()) {
        throw new CustomError('You do not have permission to access this area', 403);
    }
    return area;
}

exports.deleteAreaIfEmpty = async (userId, areaId) => {

	// Check if the route area has any routes
	const routesWithArea = await Route.find({ area: areaId, user: userId});

	// If not, delete the area
	if (routesWithArea.length === 0) {
		await Area.findByIdAndDelete(areaId);
	}

}

exports.updateAreaData = (area, newData) => {
    area.name = newData.name;
    return area;
}
