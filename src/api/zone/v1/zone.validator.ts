import { celebrate, Joi } from 'celebrate';

interface gpsLocation {
  lng: number;
  lat: number;
}

export const zoneGetAllValidator = celebrate({
  query: {
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(100),
    offset: Joi.number()
      .integer()
      .min(0)
      .default(0),
  },
});

export const zoneGetByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});

export const zonePostValidator = celebrate({
  body: {
    title: Joi.string()
      .max(50)
      .required(),
    description: Joi.string().required(),
    points: Joi.any(),
  },
});

export const zonePutByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
  body: {
    id: Joi.number(),
    title: Joi.string()
      .max(50)
      .required(),
    description: Joi.string().required(),
    points: Joi.any(),
  },
});

export const zoneDelByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});
