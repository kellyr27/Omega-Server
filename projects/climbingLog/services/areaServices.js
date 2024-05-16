const Area = require('../models/areaModel');
const CustomError = require('../utils/CustomError');

exports.findOrCreateArea = async (areaName, userId) => {

    let area = await Area.findOne({ name: areaName, user: userId});

    if (!area) {

        area = new Area({ name: areaName, user: userId });
        await area.save();
    }

    return area;
}