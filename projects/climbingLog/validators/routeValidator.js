const Joi = require('joi');

const allowedColors = ['black', 'white', 'blue', 'red', 'gray', 'green', 'yellow', 'purple', 'orange', 'pink']

const routeSchema = Joi.object({
    name: Joi.string().required(),
    colour: Joi.string().valid(...allowedColors).required(),
    grade: Joi.number().integer().min(10).max(40).required(),
}).unknown(true)

module.exports = routeSchema;