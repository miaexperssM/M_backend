import { celebrate, Joi } from 'celebrate';
import { JoinTable } from 'typeorm';

export const postSignUpValidator = celebrate({
  body: {
    name: Joi.string()
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    permissions: Joi.string().required(),
  },
});

export const addNewUserValidator = celebrate({
  body: {
    accountId: Joi.string()
      .max(30)
      .required(),
    name: Joi.string()
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    permissions: Joi.string().required(),
  },
});

export const modifyUserValidator = celebrate({
  body: {
    accountId: Joi.string()
      .max(30)
      .required(),
    name: Joi.string()
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().allow(''),
    id: Joi.number(),
    permissions: Joi.string().required(),
  },
});

export const postSignInValidator = celebrate({
  body: {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
  },
});

export const accountDelByIdValidator = celebrate({
  params: {
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  },
});
