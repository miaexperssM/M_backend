import { celebrate, Joi } from 'celebrate';
import { JoinTable } from 'typeorm';

export const getRulesByLevelValidator = celebrate({
  params: {
    level: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});

export const postRuleValidator = celebrate({
  body: {
    pickLevel: Joi.number()
      .integer()
      .positive()
      .max(5)
      .required(),
    port: Joi.number()
      .integer()
      .positive()
      .max(15)
      .required(),
    zoneId: Joi.number().integer(),
    comunaName: Joi.string()
      .default('')
      .allow(''),
  },
});

export const putRuleByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
  body: {
    id: Joi.number()
      .integer()
      .positive(),
    pickLevel: Joi.number()
      .integer()
      .positive()
      .max(5)
      .required(),
    port: Joi.number()
      .integer()
      .positive()
      .max(15)
      .required(),
    zoneId: Joi.number().integer(),
    comunaName: Joi.string()
      .default('')
      .allow(''),
  },
});

export const deleteRuleByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});

export const getLevelResultByTrackingNumberValidator = celebrate({
  params: {
    trackingNumber: Joi.string().required(),
  },
});

export const postMeasureDataValidator = celebrate({
  body: {
    barcode: Joi.string().required(),
    height: Joi.alternatives().try(Joi.string(), Joi.number()),
    weight: Joi.alternatives().try(Joi.string(), Joi.number()),
    width: Joi.alternatives().try(Joi.string(), Joi.number()),
    length: Joi.alternatives().try(Joi.string(), Joi.number()),
  },
});

export const postMeasureImageValidator = celebrate({
  body: {
    barcode: Joi.string().required(),
    image: Joi.string()
      .base64()
      .required(),
  },
});

export const exportSortPickValidator = celebrate({
  params: {
    startTime: Joi.alternatives().try(Joi.string(), Joi.number()),
    endTime: Joi.alternatives().try(Joi.string(), Joi.number()),
  },
  query: {
    limit: Joi.number()
      .integer()
      .positive()
      .required(),
    offset: Joi.number().integer(),
    type: Joi.string(),
  },
});
