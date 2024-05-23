const Joi = require('joi');

const areaSchema = Joi.object({
    name: Joi.string().required(),
	steepnessTags: Joi.array().items(Joi.string().valid('slab', 'vertical', 'overhung', 'roof')).optional()
}).unknown(true)

module.exports = areaSchema;