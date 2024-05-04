const Ascent = require('../models/ascentModel');
const CustomError = require('../utils/CustomError');
const { findOrCreateRoute } = require('./routeServices');
const getAscentsObjects = require('../uploadDb/uploadDb');


exports.findAscent = async (ascentId, userId) => {
    const ascent = await Ascent.findById(ascentId).populate('route')

    if (!ascent) {
        throw new CustomError('No ascent found with this id', 404);
    }

    if (ascent.user.toString() !== userId.toString()) {
        throw new CustomError('You do not have permission to access this ascent', 403);
    }


    return ascent;
}

exports.updateAscentData = (ascent, newData) => {
    ascent.user = newData.user;
    ascent.route = newData.route;
    ascent.date = newData.date;
    ascent.tickType = newData.tickType;
    ascent.notes = newData.notes;
    return ascent;
}

exports.uploadAscents = async (userId) => {

    const ascentObjects = await getAscentsObjects();

    for (const ascentObject of ascentObjects) {
        let route = await findOrCreateRoute(ascentObject.route, userId);

        const ascent = new Ascent({
            user: userId,
            route: route._id,
            date: ascentObject.date,
            tickType: ascentObject.tickType,
            notes: ascentObject.notes
        });

        await ascent.save();
    }
}