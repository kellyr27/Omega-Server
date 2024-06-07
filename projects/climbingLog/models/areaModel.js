const mongoose = require('mongoose');
const {getDatabaseConnection} = require('../config/database');


const areaSchema = new mongoose.Schema({
	name: { 
		type: String, 
		required: true 
	},
	user: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User', 
		required: true 
	},
	steepnessTags: { 
		type: [String], 
		enum: ['slab', 'vertical', 'overhung', 'roof'], 
		required: false,
		default: []
	}
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
	timestamps: true
});

areaSchema.index({ name: 1, user: 1 }, { unique: true });

areaSchema.virtual('routes', {
    ref: 'Route',
    localField: '_id',
    foreignField: 'area',
    justOne: false
});

const Area = getDatabaseConnection().model('Area', areaSchema);

module.exports = Area;