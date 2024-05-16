const Joi = require('joi');

const areaSchema = Joi.object({
    name: Joi.string().required(),
}).unknown(true)

module.exports = areaSchema;