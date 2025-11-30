import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().optional().trim().allow(''),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional().trim(),
  description: Joi.string().optional().trim().allow(''),
});
