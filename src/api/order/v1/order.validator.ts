import { celebrate, Joi } from 'celebrate';
import { description } from 'joi';

export const orderGetAllValidator = celebrate({
  query: {
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0),
  },
});

export const orderGetByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});

export const orderGetByTrackingNumberValidator = celebrate({
  params: {
    trackingNumber: Joi.string().required(),
  },
});

export const orderPostValidator = celebrate({
  body: {
    MAWB: Joi.string()
      .max(50)
      .required(),
    containerNumber: Joi.string().required(),
    trackingNumber: Joi.string().required(),
    shipper: Joi.string().required(),
    shipperPhoneNumber: Joi.string().required(),
    shipperAddress: Joi.string().required(),
    destinationCountry: Joi.string().required(),
    recipient: Joi.string().required(),
    RUT: Joi.string().required(),
    recipientPhoneNumber: Joi.string().required(),
    recipientEmail: Joi.string()
      .email()
      .required(),
    region: Joi.string()
      .default('')
      .allow(''),
    province: Joi.string()
      .default('')
      .allow(''),
    comuna: Joi.string()
      .default('')
      .allow(''),
    address: Joi.string().required(),
    weight: Joi.number()
      .positive()
      .required(),
    value: Joi.number()
      .positive()
      .required(),
    quantity: Joi.number()
      .positive()
      .required(),
    description: Joi.string(),
  },
});

export const orderPutByIdValidator = celebrate({
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
    MAWB: Joi.string()
      .max(50)
      .required(),
    containerNumber: Joi.string().required(),
    trackingNumber: Joi.string().required(),
    shipper: Joi.string().required(),
    shipperPhoneNumber: Joi.string().required(),
    shipperAddress: Joi.string().required(),
    destinationCountry: Joi.string().required(),
    recipient: Joi.string().required(),
    RUT: Joi.string().required(),
    recipientPhoneNumber: Joi.string().required(),
    recipientEmail: Joi.string()
      .email()
      .required(),
    region: Joi.string()
      .default('')
      .allow(''),
    province: Joi.string()
      .default('')
      .allow(''),
    comuna: Joi.string()
      .default('')
      .allow(''),
    address: Joi.string().required(),
    weight: Joi.number()
      .positive()
      .required(),
    value: Joi.number()
      .positive()
      .required(),
    quantity: Joi.number()
      .positive()
      .required(),
    description: Joi.string(),
  },
});

export const orderDelByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});
