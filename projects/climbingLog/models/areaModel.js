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
	}
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
	timestamps: true
});

const Area = getDatabaseConnection().model('Area', areaSchema);

module.exports = Area;