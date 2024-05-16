const Area = require('../models/areaModel');
const CustomError = require('../utils/CustomError');

exports.findOrCreateArea = async (areaData, userId) => {

    let area = await Area.findOne({ name: areaData.name, user: userId});

    if (!area) {
        area = new Area({ ...routeData, user: userId });
        await area.save();
    }

    return area;
}
