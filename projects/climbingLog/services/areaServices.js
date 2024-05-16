// const Area = require('../models/areaModel');
// const Route = require('../models/routeModel');
// const CustomError = require('../utils/CustomError');

// exports.findOrCreateArea = async (areaData, userId) => {

//     let area = await Area.findOne({ name: areaData.name, user: userId});

//     if (!area) {
//         area = new Area({ ...routeData, user: userId });
//         await area.save();
//     }

//     return area;
// }

// exports.deleteAreaIfEmpty = async (userId, areaId) => {

// 	// Check if the route area has any routes
// 	const routesWithArea = await Route.find({ area: areaId, user: userId});

// 	// If not, delete the area
// 	if (routesWithArea.length === 0) {
// 		await Area.findByIdAndDelete(areaId);
// 	}

// }

