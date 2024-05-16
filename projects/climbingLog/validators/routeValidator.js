const Joi = require('joi');
const areaValidator = require('./areaValidator');


const allowedColors = ['black', 'white', 'blue', 'red', 'gray', 'green', 'yellow', 'purple', 'orange', 'pink']

const routeSchema = Joi.object({
    name: Joi.string().required(),
    colour: Joi.string().valid(...allowedColors).required(),
    grade: Joi.number().integer().min(10).max(40).required(),
	area: areaValidator.required()
}).unknown(true)

module.exports = routeSchema;