import Joi from 'joi';

export const createCarSchema = Joi.object({
  nom: Joi.string().required(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'category must be a valid MongoDB ObjectId',
  }),
  prixParJour: Joi.number().greater(0).required(),
  matricule: Joi.string().required(),
  modele: Joi.string().required(),
  marque: Joi.string().required(),
  disponibilite: Joi.boolean().optional(),
  dernierMaintenance: Joi.date().optional(),
}).unknown(false);

export const updateCarSchema = Joi.object({
  nom: Joi.string().optional(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
    'string.pattern.base': 'category must be a valid MongoDB ObjectId',
  }),
  prixParJour: Joi.number().greater(0).optional(),
  matricule: Joi.string().optional(),
  modele: Joi.string().optional(),
  marque: Joi.string().optional(),
  disponibilite: Joi.boolean().optional(),
  dernierMaintenance: Joi.date().optional(),
});
