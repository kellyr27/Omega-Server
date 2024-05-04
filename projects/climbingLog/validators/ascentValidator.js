const Joi = require('joi');
const routeValidator = require('./routeValidator');

const ascentSchema = Joi.object({
    route: routeValidator.required(),
    date: Joi.date().required(),
    tickType: Joi.string().valid('redpoint', 'flash', 'hangdog', 'attempt').required(),
    notes: Joi.string().allow('').optional()
}).unknown(true)

module.exports = ascentSchema;