const mongoose = require('mongoose');
const {getDatabaseConnection} = require('../config/database');

const routeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    colour: { 
        type: String, 
        required: true 
    },
    grade: { 
        type: Number, 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

routeSchema.index({ name: 1, user: 1 }, { unique: true });

routeSchema.virtual('ascents', {
    ref: 'Ascent',
    localField: '_id',
    foreignField: 'route',
    justOne: false
});

const Route = getDatabaseConnection().model('Route', routeSchema);

module.exports = Route;